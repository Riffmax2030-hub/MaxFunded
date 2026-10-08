#!/usr/bin/env bash
# ========================================================
# MaxFunded Prop Firm - 1-Click Linux VPS Setup Script
# Supported OS: Ubuntu 22.04 / 24.04 LTS, Debian 12
# ========================================================

set -euo pipefail

echo "=========================================================="
echo ">>> MAXFUNDED PROP FIRM - INITIALIZING SERVER SETUP <<<"
echo "=========================================================="

# 1. Update OS packages
echo "[1/6] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw htop ca-certificates gnupg lsb-release

# 2. Configure Firewall (UFW)
echo "[2/6] Configuring firewall rules (SSH: 22, HTTP: 80, HTTPS: 443)..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

# 3. Install Docker Engine & Docker Compose Plugin
echo "[3/6] Installing Docker & Docker Compose..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker "$USER"
    echo "  - Docker installed successfully."
else
    echo "  - Docker is already installed."
fi

# 4. Install Caddy Web Server (Automated Free SSL)
echo "[4/6] Installing Caddy Web Server..."
if ! command -v caddy &> /dev/null; then
    sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLF 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLF 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt-get update -y
    sudo apt-get install -y caddy
    echo "  - Caddy installed successfully."
else
    echo "  - Caddy is already installed."
fi

# 5. Project Directory Setup
echo "[5/6] Setting up project deployment directory..."
TARGET_DIR="/opt/maxfunded"
sudo mkdir -p "$TARGET_DIR"
sudo chown -R "$USER":"$USER" "$TARGET_DIR"

echo "=========================================================="
echo ">>> BASE SERVER SETUP COMPLETE! <<<"
echo "Next steps:"
echo " 1. Copy your repository files into $TARGET_DIR"
echo " 2. Fill in your secrets in $TARGET_DIR/backend/.env"
echo " 3. Copy deploy/Caddyfile to /etc/caddy/Caddyfile"
echo " 4. Run: cd $TARGET_DIR && docker compose up -d --build"
echo " 5. Run: sudo systemctl restart caddy"
echo "=========================================================="
