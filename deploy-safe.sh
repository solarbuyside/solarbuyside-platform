#!/usr/bin/env bash
# Solar Buy Side v2 - Safe Deployment Script
# Features:
#  - Auto-detects WEBROOT (public_html or domains/*/public_html)
#  - Backup before deploy
#  - Uses rsync for safe publishing (no rm -rf)
#  - Preserves .htaccess if needed
#  - Idempotent and repeatable
#  - Clear logging

set -euo pipefail

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    local level="$1"
    shift
    local msg="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    case "$level" in
        ERROR)   echo -e "${RED}[${timestamp}] [ERROR]${NC} $msg" ;;
        WARN)    echo -e "${YELLOW}[${timestamp}] [WARN]${NC} $msg" ;;
        INFO)    echo -e "${GREEN}[${timestamp}] [INFO]${NC} $msg" ;;
        DEBUG)   echo -e "${BLUE}[${timestamp}] [DEBUG]${NC} $msg" ;;
        *)       echo "[${timestamp}] $msg" ;;
    esac
}

# Global variables
HOME_DIR="${HOME}"
REPO_DIR="${HOME_DIR}/repos/solar-buy-side-v2"
BACKUP_BASE="${HOME_DIR}/backup_public_html"
BACKUP_DIR=""
WEBROOT=""
HTACCESS_PRESERVED=""

# ============================================================================
# STEP 0: Auto-detect WEBROOT
# ============================================================================
detect_webroot() {
    log INFO "Detecting WEBROOT..."

    # Try ~/public_html first
    if [ -d "${HOME_DIR}/public_html" ]; then
        WEBROOT="${HOME_DIR}/public_html"
        log INFO "Found: ~/public_html"
        return 0
    fi

    # Try ~/domains/*/public_html
    if [ -d "${HOME_DIR}/domains" ]; then
        local candidate
        candidate=$(find "${HOME_DIR}/domains" -maxdepth 3 -type d -name "public_html" 2>/dev/null | head -n 1 || true)
        if [ -n "${candidate}" ]; then
            WEBROOT="${candidate}"
            log INFO "Found: ${candidate}"
            return 0
        fi
    fi

    log ERROR "Could not detect WEBROOT. Neither ~/public_html nor ~/domains/*/public_html found."
    return 1
}

# ============================================================================
# STEP 1: Pre-flight checks
# ============================================================================
preflight() {
    log INFO "Running pre-flight checks..."

    if [ ! -d "${REPO_DIR}" ]; then
        log ERROR "Repository not found at ${REPO_DIR}"
        return 1
    fi
    log INFO "✓ Repository directory exists"

    if [ ! -d "${WEBROOT}" ]; then
        log ERROR "WEBROOT not accessible: ${WEBROOT}"
        return 1
    fi
    log INFO "✓ WEBROOT accessible: ${WEBROOT}"

    # Check for git
    if ! command -v git &> /dev/null; then
        log ERROR "git not found in PATH"
        return 1
    fi
    log INFO "✓ git is available"

    # Check for Node/NPM
    if ! command -v node &> /dev/null; then
        log ERROR "node not found. Node.js must be installed."
        return 1
    fi
    log DEBUG "node version: $(node --version)"

    if ! command -v npm &> /dev/null; then
        log ERROR "npm not found. npm must be installed."
        return 1
    fi
    log DEBUG "npm version: $(npm --version)"

    return 0
}

# ============================================================================
# STEP 2: Create backup
# ============================================================================
create_backup() {
    log INFO "Creating backup..."

    mkdir -p "${BACKUP_BASE}"
    BACKUP_DIR="${BACKUP_BASE}/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "${BACKUP_DIR}"

    log DEBUG "Backup directory: ${BACKUP_DIR}"

    # Backup entire WEBROOT
    if [ "$(ls -A "${WEBROOT}")" ]; then
        log INFO "Copying WEBROOT contents to backup..."
        cp -a "${WEBROOT}/." "${BACKUP_DIR}/" 2>/dev/null || {
            log WARN "Some files could not be backed up, but continuing..."
        }
        log INFO "✓ Backup complete"
    else
        log WARN "WEBROOT is empty, creating empty backup directory"
        mkdir -p "${BACKUP_DIR}/."
    fi

    # Preserve .htaccess separately if it exists
    if [ -f "${WEBROOT}/.htaccess" ]; then
        HTACCESS_PRESERVED="${BACKUP_DIR}/.htaccess.preserved"
        cp -a "${WEBROOT}/.htaccess" "${HTACCESS_PRESERVED}"
        log INFO "✓ .htaccess preserved at: ${HTACCESS_PRESERVED}"
    fi

    log DEBUG "Backup size: $(du -sh "${BACKUP_DIR}" | cut -f1)"
}

# ============================================================================
# STEP 3: Update repository and build
# ============================================================================
update_and_build() {
    log INFO "Updating repository and building..."

    cd "${REPO_DIR}"

    # Get current branch for reference
    local current_branch
    current_branch=$(git branch --show-current)
    log DEBUG "Current branch: ${current_branch}"

    # Pull latest
    log DEBUG "Running: git pull"
    if ! git pull; then
        log ERROR "git pull failed"
        return 1
    fi
    log INFO "✓ Repository updated"

    # Install dependencies
    log DEBUG "Running: npm ci (or npm install)"
    if [ -f "package-lock.json" ]; then
        npm ci --prefer-offline --no-audit || npm install
    else
        npm install
    fi
    log INFO "✓ Dependencies installed"

    # Build
    log DEBUG "Running: npm run build"
    if ! npm run build; then
        log ERROR "Build failed"
        return 1
    fi
    log INFO "✓ Build completed"

    # Verify dist exists and has content
    if [ ! -d "dist" ]; then
        log ERROR "dist/ directory not created by build"
        return 1
    fi

    if [ -z "$(ls -A "dist")" ]; then
        log ERROR "dist/ directory is empty"
        return 1
    fi

    local dist_size
    dist_size=$(du -sh "dist" | cut -f1)
    local file_count
    file_count=$(find dist -type f | wc -l)
    log INFO "✓ Build validated: ${dist_size} (${file_count} files)"
}

# ============================================================================
# STEP 4: Publish with rsync
# ============================================================================
publish() {
    log INFO "Publishing build to WEBROOT..."

    cd "${REPO_DIR}"

    if [ ! -d "dist" ]; then
        log ERROR "dist/ not found. Cannot publish."
        return 1
    fi

    log DEBUG "Using rsync to publish (safe replace)..."
    log DEBUG "Command: rsync -av --delete dist/ ${WEBROOT}/"

    if rsync -av --delete dist/ "${WEBROOT}/" | head -50; then
        log INFO "✓ Files published"
    else
        log ERROR "rsync failed"
        return 1
    fi
}

# ============================================================================
# STEP 5: Restore .htaccess if needed
# ============================================================================
restore_htaccess() {
    if [ -n "${HTACCESS_PRESERVED}" ] && [ -f "${HTACCESS_PRESERVED}" ]; then
        if [ ! -f "${WEBROOT}/.htaccess" ]; then
            log INFO "Restoring .htaccess to WEBROOT..."
            cp -a "${HTACCESS_PRESERVED}" "${WEBROOT}/.htaccess"
            log INFO "✓ .htaccess restored"
        fi
    fi
}

# ============================================================================
# STEP 6: Verify and report
# ============================================================================
verify_deployment() {
    log INFO "Verifying deployment..."

    if [ ! -f "${WEBROOT}/index.html" ]; then
        log WARN "index.html not found in WEBROOT"
    else
        log INFO "✓ index.html present"
    fi

    log INFO "WEBROOT contents (top 20 items):"
    ls -lh "${WEBROOT}" | head -20

    local webroot_size
    webroot_size=$(du -sh "${WEBROOT}" | cut -f1)
    log INFO "WEBROOT size: ${webroot_size}"
}

# ============================================================================
# STEP 7: Rollback helper
# ============================================================================
show_rollback_info() {
    log INFO ""
    log INFO "=========================================="
    log INFO "DEPLOYMENT COMPLETE"
    log INFO "=========================================="
    log INFO "If you need to rollback, backups are in:"
    log INFO "  ${BACKUP_BASE}/"
    log INFO ""
    log INFO "To rollback to the last backup:"
    log INFO "  LATEST_BACKUP=\$(ls -t ${BACKUP_BASE} | head -1)"
    log INFO "  rm -rf ${WEBROOT}/*"
    log INFO "  cp -a ${BACKUP_BASE}/\${LATEST_BACKUP}/. ${WEBROOT}/"
    log INFO "=========================================="
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
main() {
    log INFO "=========================================="
    log INFO "Solar Buy Side v2 - Deployment"
    log INFO "Started: $(date)"
    log INFO "=========================================="
    log INFO ""

    # Detect WEBROOT
    if ! detect_webroot; then
        log ERROR "WEBROOT detection failed"
        exit 1
    fi

    # Pre-flight
    if ! preflight; then
        log ERROR "Pre-flight checks failed"
        exit 1
    fi

    # Backup
    if ! create_backup; then
        log ERROR "Backup creation failed"
        exit 1
    fi

    # Update and build
    if ! update_and_build; then
        log ERROR "Update and build failed"
        log WARN "Rolling back to last backup..."
        if [ -n "${BACKUP_DIR}" ] && [ -d "${BACKUP_DIR}" ]; then
            log WARN "Restoring from: ${BACKUP_DIR}"
            rm -rf "${WEBROOT:?}"/*
            cp -a "${BACKUP_DIR}/." "${WEBROOT}/"
            log WARN "Rollback complete"
        fi
        exit 1
    fi

    # Publish
    if ! publish; then
        log ERROR "Publication failed"
        log WARN "Rolling back to last backup..."
        if [ -n "${BACKUP_DIR}" ] && [ -d "${BACKUP_DIR}" ]; then
            log WARN "Restoring from: ${BACKUP_DIR}"
            rm -rf "${WEBROOT:?}"/*
            cp -a "${BACKUP_DIR}/." "${WEBROOT}/"
            log WARN "Rollback complete"
        fi
        exit 1
    fi

    # Restore .htaccess
    restore_htaccess

    # Verify
    verify_deployment

    # Show rollback info
    show_rollback_info

    log INFO "Deployment successful!"
    exit 0
}

# Trap errors
trap 'log ERROR "Deployment failed at line $LINENO"; exit 1' ERR

# Run main
main "$@"
