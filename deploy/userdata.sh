#!/bin/bash
set -e

# NovaLens EC2 Bootstrap Script
# Amazon Linux 2023, Node.js 22, PM2

LOG=/var/log/novalens-setup.log
exec > >(tee -a $LOG) 2>&1
echo "=== NovaLens Setup Started: $(date) ==="

# Update system
dnf update -y

# Install Node.js 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs git

# Verify versions
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo "git: $(git --version)"

# Install PM2 globally
npm install -g pm2

# Setup app directory
APP_DIR=/home/ec2-user/novalens
mkdir -p $APP_DIR

# Clone repository
git clone https://github.com/HAR5HA-7663/novalens.git $APP_DIR
cd $APP_DIR

# Install server dependencies
npm install --production

# Install client dependencies and build
cd client
npm install
npm run build
cd ..

# Configure iptables: port 80 -> 3000
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
# Save iptables rules
dnf install -y iptables-services
service iptables save
systemctl enable iptables

# Start with PM2
pm2 start server/index.js --name novalens --env production
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Set ownership
chown -R ec2-user:ec2-user $APP_DIR

echo "=== NovaLens Setup Complete: $(date) ==="
echo "App running at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
