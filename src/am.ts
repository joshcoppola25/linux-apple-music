import net from 'net';

const SOCKET_PATH = '/tmp/apple-music.sock';
const client = net.createConnection(SOCKET_PATH);
const args = process.argv.slice(2).join(' ');

client.on('connect', () => {
    client.write(args);
    setTimeout(() => client.end(), 100);
});

client.on('error', (err: any) => {
    console.error(`Connection Error: ${err.code}`);
    if (err.code === 'ECONNREFUSED') console.error("Daemon is running but refusing connections.");
    if (err.code === 'ENOENT') console.error("Socket file not found in /tmp.");
    process.exit(1);
});