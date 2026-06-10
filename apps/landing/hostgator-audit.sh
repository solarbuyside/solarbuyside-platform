#!/usr/bin/env bash
# HostGator Deployment Audit Script
# Run this on HostGator server via SSH or cPanel Terminal
# Output: Complete audit report for Claude to analyze

set +e  # Don't exit on errors, just report them

echo "==============================================="
echo "HOSTGATOR DEPLOYMENT AUDIT"
echo "Generated: $(date)"
echo "==============================================="
echo ""

# PART A: Basic Information
echo "=== PART A: BASIC INFORMATION ==="
echo ""

echo "[A1] User and Home"
echo "----"
echo "whoami: $(whoami)"
echo "HOME: $HOME"
echo "PWD: $(pwd)"
echo ""

echo "[A2] Home Directory Structure"
echo "----"
ls -la ~ | head -40
echo ""

echo "[A3] Check for public_html"
echo "----"
if [ -d "$HOME/public_html" ]; then
  echo "✓ ~/public_html EXISTS"
  ls -la "$HOME/public_html" | head -40
else
  echo "✗ ~/public_html does NOT exist"
fi
echo ""

echo "[A4] Check for domains structure"
echo "----"
if [ -d "$HOME/domains" ]; then
  echo "✓ ~/domains EXISTS"
  ls -la "$HOME/domains" | head -20
  echo ""
  echo "Finding public_html under domains..."
  find "$HOME/domains" -maxdepth 3 -type d -name "public_html" 2>/dev/null | head -20
else
  echo "✗ ~/domains does NOT exist"
fi
echo ""

# Auto-detect WEBROOT
echo "[A5] Auto-detecting WEBROOT"
echo "----"
WEBROOT="$HOME/public_html"
if [ -d "$HOME/domains" ]; then
  CAND=$(find "$HOME/domains" -maxdepth 3 -type d -name public_html 2>/dev/null | head -n 1)
  if [ -n "$CAND" ]; then
    WEBROOT="$CAND"
  fi
fi
echo "DETECTED WEBROOT: $WEBROOT"
echo ""

echo "[A6] WEBROOT Contents (full listing)"
echo "----"
if [ -d "$WEBROOT" ]; then
  echo "✓ WEBROOT is accessible"
  ls -la "$WEBROOT" | head -60
  echo ""
  echo "Important files check:"
  echo "  .htaccess: $([ -f "$WEBROOT/.htaccess" ] && echo "✓ EXISTS" || echo "✗ NOT FOUND")"
  echo "  robots.txt: $([ -f "$WEBROOT/robots.txt" ] && echo "✓ EXISTS" || echo "✗ NOT FOUND")"
  echo "  sitemap.xml: $([ -f "$WEBROOT/sitemap.xml" ] && echo "✓ EXISTS" || echo "✗ NOT FOUND")"
else
  echo "✗ WEBROOT does NOT exist or not accessible"
fi
echo ""

# PART B: Node/NPM Check
echo "=== PART B: NODE/NPM VERSIONS ==="
echo "----"
echo "node: $(node -v 2>&1 || echo 'NOT FOUND')"
echo "npm: $(npm -v 2>&1 || echo 'NOT FOUND')"
echo ""

# PART C: Repository Check
echo "=== PART C: REPOSITORY STATUS ==="
echo "----"

if [ -d "$HOME/repos/solar-buy-side-v2/.git" ]; then
  echo "✓ Repository EXISTS at $HOME/repos/solar-buy-side-v2"
  echo ""
  cd "$HOME/repos/solar-buy-side-v2" 2>/dev/null && {
    echo "Branch: $(git branch --show-current)"
    echo "Remote: $(git remote -v)"
    echo ""
    echo "Git Status:"
    git status
    echo ""
    echo "Last 3 commits:"
    git log --oneline -3
  }
else
  echo "✗ Repository does NOT exist at $HOME/repos/solar-buy-side-v2"
fi
echo ""

# PART D: Package.json Check
echo "=== PART D: PACKAGE.JSON ==="
echo "----"
if [ -f "$HOME/repos/solar-buy-side-v2/package.json" ]; then
  echo "✓ package.json found"
  cat "$HOME/repos/solar-buy-side-v2/package.json"
else
  echo "✗ package.json NOT found"
fi
echo ""

# PART E: Deploy.sh Check
echo "=== PART E: DEPLOY.SH STATUS ==="
echo "----"
DEPLOY_SH="$HOME/repos/solar-buy-side-v2/deploy.sh"
if [ -f "$DEPLOY_SH" ]; then
  echo "✓ deploy.sh exists"
  echo ""
  echo "File type and encoding:"
  file "$DEPLOY_SH"
  echo ""
  echo "First 10 lines (raw):"
  head -n 10 "$DEPLOY_SH" | cat -A
  echo ""
  echo "Permissions:"
  ls -l "$DEPLOY_SH"
else
  echo "✗ deploy.sh NOT found"
fi
echo ""

# PART F: Disk Space
echo "=== PART F: DISK SPACE ==="
echo "----"
echo "Home directory usage:"
du -sh "$HOME" 2>/dev/null || echo "Cannot determine"
echo ""
echo "public_html usage:"
du -sh "$WEBROOT" 2>/dev/null || echo "Cannot determine"
echo ""

# PART G: Important system info
echo "=== PART G: SYSTEM INFO ==="
echo "----"
echo "OS: $(uname -s)"
echo "Kernel: $(uname -r)"
echo "Uptime: $(uptime 2>/dev/null || echo 'N/A')"
echo ""

echo "==============================================="
echo "END OF AUDIT REPORT"
echo "==============================================="
