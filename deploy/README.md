# MaxFunded Prop Firm — VPS Deployment Guide

Automated deployment instructions to run MaxFunded Prop Firm on a remote Linux server (Cloud VPS) with automatic HTTPS SSL certificates.

---

## 1. Recommended VPS Providers & Specs

* **Minimum Specs**: 2 vCPU, 4 GB RAM, 40 GB SSD (Ubuntu 22.04 or 24.04 LTS)
* **Recommended Affordable Providers**:
  * **Hetzner Cloud**: CX22 or CPX21 (~$5 to $8/month) — fast, European / US locations
  * **Contabo**: Cloud VPS S (~$6/month) — high RAM (8GB)
  * **DigitalOcean**: Basic Droplet (~$12/month)
  * **OVHcloud / Vultr**: ~$6 to $10/month

---

## 2. One-Click Deployment from Windows (PowerShell)

You can deploy the entire platform directly from your Windows machine using the included script:

```powershell
# Open PowerShell in the project root and run:
.\deploy\deploy_vps.ps1
```

The script will prompt you for:
1. **VPS Public IP Address**: (e.g., `142.93.120.45` provided by your VPS host)
2. **Domain Name**: (e.g., `maxfunded.com` — or leave blank to deploy on the IP address first)

The script automatically:
* Installs **Docker**, **Docker Compose**, and **UFW Firewall** on your VPS.
* Installs **Caddy Web Server** (which issues and renews free SSL certificates automatically).
* Packs and transfers your code (excluding bulky local files like `node_modules`).
* Starts all containers (`PostgreSQL`, `Redis`, `Backend`, `Frontend`).
* Tests the remote health endpoint.

---

## 3. Alternative: Manual Deployment Directly on the VPS

If you prefer to SSH into your server directly:

```bash
# 1. SSH into your VPS
ssh root@YOUR_VPS_IP

# 2. Download and run the bootstrap script
curl -fsSL https://raw.githubusercontent.com/Riffmax-Technologies/PROP-FIRM/main/deploy/setup_vps.sh | bash

# 3. Clone or copy your project into /opt/maxfunded
cd /opt/maxfunded
git clone https://github.com/Riffmax-Technologies/PROP-FIRM.git .

# 4. Fill in your environment variables in backend/.env
nano backend/.env

# 5. Launch the containers
docker compose up -d --build

# 6. Configure Caddy with your domain or IP
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
# Edit /etc/caddy/Caddyfile and replace {$DOMAIN:localhost} with your domain or VPS IP
sudo nano /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

---

## 4. Post-Deployment Checklist

1. **Check Live Containers**:
   ```bash
   docker compose ps
   ```
2. **View Live Application Logs**:
   ```bash
   docker compose logs -f backend
   docker compose logs -f frontend
   ```
3. **Seed Initial MT5 Accounts on VPS**:
   ```bash
   docker compose exec backend python scripts/seed_account_pool.py
   ```
4. **Access Portals**:
   * **Trader Web App**: `https://your-domain.com` (or `http://YOUR_VPS_IP`)
   * **Admin Hub**: `https://your-domain.com/admin`
   * **Account Pool Manager**: `https://your-domain.com/admin/pool`
