#!/bin/bash
# NovaLens EC2 Bootstrap — Amazon Linux 2023
LOG=/var/log/novalens-setup.log
exec > >(tee -a $LOG) 2>&1
echo "=== NovaLens Setup Started: $(date) ==="

# Update system
dnf update -y

# Install Node.js 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs git

echo "Node: $(node --version)"
echo "npm: $(npm --version)"

# Install PM2 globally
npm install -g pm2

# Setup app
APP_DIR=/home/ec2-user/novalens
git clone https://github.com/HAR5HA-7663/novalens.git $APP_DIR
cd $APP_DIR

# Install and build
npm install --production
cd client && npm install && npm run build && cd ..

# Run on port 80 directly as root (simplest approach for AL2023)
PORT=80 pm2 start server/index.js --name novalens
pm2 save

# Persist across reboots
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
systemctl enable pm2-root

chown -R ec2-user:ec2-user $APP_DIR

echo "=== NovaLens Setup Complete: $(date) ==="
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "App running at http://$PUBLIC_IP"
