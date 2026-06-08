#!/usr/bin/env bash
# Solar Buy Side v2 - Full Audit and Deploy Script
# This script performs AUDIT (Phase 1-2) and optionally DEPLOY (Phase 3)
# Safety-first: backup before any change, use rsync, no rm -rf

set +e  # Continue on errors

echo "==============================================="
echo "SOLAR BUY SIDE v2 - AUDIT AND DEPLOY"
echo "Started: $(date)"
echo "==============================================="
echo ""

# ============================================================================
# PHASE 1 & 2: AUDIT
# ============================================================================
echo ">>> PHASE 1 & 2: RUNNING AUDIT (No changes yet)"
echo ""

# Phase 1: Basic info
echo "=== PHASE 1: BASIC INFORMATION ==="
echo ""
echo "whoami: $(whoami)"
echo "HOME: $HOME"
echo "PWD: $(pwd)"
echo ""

# Phase 2: Download and run audit script
echo "=== PHASE 2: DOWNLOADING AND RUNNING AUDIT SCRIPT ==="
echo ""

# Try curl first
if command -v curl &> /dev/null; then
    echo "[*] Using curl to download..."
    curl -fsSL https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/hostgator-audit.sh -o ~/hostgator-audit.sh
    DOWNLOAD_OK=$?
elif command -v wget &> /dev/null; then
    echo "[*] curl not found, using wget..."
    wget -qO ~/hostgator-audit.sh https://raw.githubusercontent.com/gabrielfeelix/solar-buy-side-v2/main/hostgator-audit.sh
    DOWNLOAD_OK=$?
else
    echo "[ERROR] Neither curl nor wget found. Cannot download audit script."
    echo "Please install curl or wget, or copy hostgator-audit.sh manually to ~/"
    exit 1
fi

if [ $DOWNLOAD_OK -ne 0 ]; then
    echo "[ERROR] Failed to download audit script"
    exit 1
fi

echo "[✓] Downloaded successfully"
echo ""

# Fix CRLF and run
echo "[*] Fixing CRLF line endings..."
sed -i 's/\r$//' ~/hostgator-audit.sh || true

echo "[*] Setting executable permissions..."
chmod +x ~/hostgator-audit.sh

echo "[*] Running audit script..."
echo ""
echo "=========================================="
~/hostgator-audit.sh
AUDIT_EXIT=$?
echo "=========================================="
echo ""

if [ $AUDIT_EXIT -ne 0 ]; then
    echo "[WARNING] Audit script exited with code $AUDIT_EXIT"
    echo "Review the output above for any issues."
fi

echo ""
echo "=== AUDIT COMPLETE ==="
echo ""
echo ">>> COPY THE OUTPUT ABOVE AND SEND TO CLAUDE <<<"
echo ""
echo "If everything looks OK, continue with Phase 3..."
echo ""

# ============================================================================
# PHASE 3: DEPLOY SEGURO (only if user wants to continue)
# ============================================================================
echo ""
echo "=== PHASE 3: DEPLOY SEGURO (Optional) ==="
echo ""
read -p "Do you want to continue with SAFE DEPLOY? (yes/no): " -r CONTINUE_DEPLOY

if [[ ! $CONTINUE_DEPLOY =~ ^[yY][eE][sS]$ ]]; then
    echo "[*] Skipping Phase 3. You can run it later with:"
    echo "    bash ~/repos/solar-buy-side-v2/deploy-safe.sh"
    exit 0
fi

echo ""
echo "[*] Starting Phase 3: Clone repo and deploy..."
echo ""

# Phase 3.1: Clone repo
echo "=== PHASE 3.1: CLONING/UPDATING REPOSITORY ==="
echo ""

mkdir -p ~/repos
cd ~/repos || exit 1

if [ -d solar-buy-side-v2/.git ]; then
    echo "[*] Repository exists, pulling updates..."
    cd solar-buy-side-v2 || exit 1
    git pull
    cd .. || exit 1
else
    echo "[*] Repository does not exist, cloning..."
    git clone git@github.com:gabrielfeelix/solar-buy-side-v2.git
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to clone. Check SSH keys and GitHub access."
        exit 1
    fi
fi

echo "[✓] Repository ready"
echo ""

# Phase 3.2: Normalize line endings
echo "=== PHASE 3.2: NORMALIZING SCRIPTS ==="
echo ""

cd ~/repos/solar-buy-side-v2 || exit 1

echo "[*] Fixing CRLF in deploy scripts..."
sed -i 's/\r$//' deploy-safe.sh 2>/dev/null || true
sed -i 's/\r$//' deploy.sh 2>/dev/null || true

echo "[*] Setting executable permissions..."
chmod +x deploy-safe.sh 2>/dev/null || true
chmod +x deploy.sh 2>/dev/null || true

echo "[✓] Scripts normalized"
echo ""

# Phase 3.3: Run deploy-safe
echo "=== PHASE 3.3: RUNNING SAFE DEPLOY ==="
echo ""
echo "=========================================="
bash ~/repos/solar-buy-side-v2/deploy-safe.sh
DEPLOY_EXIT=$?
echo "=========================================="
echo ""

if [ $DEPLOY_EXIT -eq 0 ]; then
    echo "[✓] Deploy completed successfully!"
else
    echo "[ERROR] Deploy failed with exit code $DEPLOY_EXIT"
    echo "Check the output above for details."
    exit 1
fi

echo ""

# Phase 3.4: Validate
echo "=== PHASE 3.4: POST-DEPLOY VALIDATION ==="
echo ""

echo "[*] Checking WEBROOT contents..."
echo ""

# Determine WEBROOT (same logic as deploy-safe.sh)
WEBROOT="$HOME/public_html"
if [ -d "$HOME/domains" ]; then
    CAND=$(find "$HOME/domains" -maxdepth 3 -type d -name public_html 2>/dev/null | head -n 1 || true)
    if [ -n "$CAND" ]; then
        WEBROOT="$CAND"
    fi
fi

echo "Detected WEBROOT: $WEBROOT"
echo ""

if [ -d "$WEBROOT" ]; then
    echo "WEBROOT contents (head -40):"
    ls -lah "$WEBROOT" | head -40
    echo ""
    echo "Important files:"
    ls -la "$WEBROOT/.htaccess" 2>/dev/null || echo "  (no .htaccess)"
    ls -la "$WEBROOT/index.html" 2>/dev/null || echo "  (no index.html)"
    echo ""
    echo "WEBROOT size: $(du -sh "$WEBROOT" | cut -f1)"
else
    echo "[ERROR] WEBROOT not found: $WEBROOT"
fi

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo ""
echo "Next steps:"
echo "1. Verify the site loads at your domain"
echo "2. Check for any errors in browser console (F12)"
echo "3. If everything looks good, configure GitHub Secrets"
echo "4. GitHub Actions will do automatic deploys from now on"
echo ""
