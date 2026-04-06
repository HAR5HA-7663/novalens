#!/bin/bash
set -euxo pipefail
exec > /var/log/userdata.log 2>&1

dnf update -y

curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs git

npm install -g pm2

cd /home/ec2-user
git clone https://github.com/HAR5HA-7663/novalens.git
chown -R ec2-user:ec2-user novalens
cd novalens

npm run setup

sudo -u ec2-user pm2 start server/index.js --name novalens
sudo -u ec2-user pm2 startup systemd -u ec2-user --hp /home/ec2-user
sudo -u ec2-user pm2 save

iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
dnf install -y iptables-services
service iptables save
systemctl enable iptables

echo "NovaLens deployment complete"
