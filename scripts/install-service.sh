#!/bin/bash

# Get the absolute path of the project directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."
SERVICE_FILE="/etc/systemd/system/music-daemon.service"
USER=$(whoami)

echo "🛠 Creating systemd service for user: $USER..."

# Create the service file content
cat <<EOF | sudo tee $SERVICE_FILE > /dev/null
[Unit]
Description=Apple Music Linux Daemon
After=network.target

[Service]
User=$USER
WorkingDirectory=$DIR
ExecStart=$(which node) $DIR/node_modules/.bin/ts-node $DIR/src/background.ts
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Reload and enable
sudo systemctl daemon-reload
sudo systemctl enable music-daemon
sudo systemctl restart music-daemon

echo "Service installed and started! Use 'sudo journalctl -u music-daemon -f' to see logs."