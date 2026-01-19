import fs from 'fs';
import net from 'net';
import { MusicPlayer } from './player';
import { TOKEN_FILE } from './config';
import { createServer } from './server';
import { fetchFreshDevToken } from './tokenUtils';

const SOCKET_PATH = '/tmp/apple-music.sock';
let currentDevToken: string;

async function startDaemon() {
    // 1. Refresh Developer Token automatically
    try {
        currentDevToken = fetchFreshDevToken();
        console.log("Developer Token loaded");
    } catch (e) {
        console.error("Failed to fetch dev token, using config fallback.");
    }

    const player = new MusicPlayer((data) => {
        if (data.type === 'ERROR' && data.msg.includes('401')) {
            console.log("Auth Expired (401). Go to http://localhost:3000/auth");
        }
    });

    const { server } = createServer(player, currentDevToken, (newToken) => {
        console.log("New User Token received");
        fs.writeFileSync(TOKEN_FILE, newToken);
        player.init(newToken, currentDevToken); 
    });

    if (fs.existsSync(TOKEN_FILE)) {
        const savedToken = fs.readFileSync(TOKEN_FILE, 'utf-8');
        console.log("Starting Player");
        await player.init(savedToken, currentDevToken);
    } else {
        console.log("No user token found. Go to http://localhost:3000/auth to login.");
    }

    if (fs.existsSync(SOCKET_PATH)) fs.unlinkSync(SOCKET_PATH);
    const controlServer = net.createServer((socket) => {
        socket.on('data', async (data) => {
            const [command, arg] = data.toString().trim().split(' ');
            if (command === 'play') await player.playSong(arg);
            if (command === 'pause') await player.togglePause();
        });
    });

    controlServer.listen(SOCKET_PATH, () => {
        fs.chmodSync(SOCKET_PATH, '777');
        console.log("Control Socket ready.");
    });
}

async function cleanup() {
    console.log("Cleaning up session tokens");
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            fs.unlinkSync(TOKEN_FILE);
            console.log("Developer token cleared");
        }
    } catch (e) {
        console.error("Error during cleanup:", e);
    }
    process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

startDaemon();