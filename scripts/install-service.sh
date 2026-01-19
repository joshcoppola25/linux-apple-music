#!/bin/bash

DIR=$(realpath "$(dirname "${BASH_SOURCE[0]}")/..")
SERVICE_FILE="/etc/systemd/system/music-daemon.service"
USER=$(whoami)
NODE_BIN=$(which node)

COMMAND="$NODE_BIN $DIR/node_modules/.bin/ts-node $DIR/src/background.ts"

echo "Installing service with path: $DIR"

cat <<EOF | sudo tee $SERVICE_FILE > /dev/null
[Unit]
Description=Apple Music Linux Daemon
After=network-online.target

[Service]
User=$USER
WorkingDirectory=$DIR
ExecStart=$COMMAND
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl restart music-daemon

echo "Service updated. Checking status..."
sleep 2
sudo systemctl status music-daemon