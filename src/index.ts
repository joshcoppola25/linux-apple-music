import fs from 'fs';
import { createServer } from './server';
import { MusicPlayer } from './player';
import { TOKEN_FILE, getDevToken } from './config';

let devToken = getDevToken();

const player = new MusicPlayer((data) => {
    console.log(`📩 Player Event: ${data.type}`);

    if (data.type === 'PLAYLISTS_LIST') {
        console.log("\n---YOUR PLAYLISTS ---");
        // Use console.table for a beautiful, readable list in the terminal
        console.table(data.data.map(pl => ({
            Name: pl.name,
            ID: pl.id
        })));
        console.log("-------------------------\n");
    }
});

const backend = createServer(player, devToken, (token) => {
    console.log("✅ New Token Received");
    fs.writeFileSync(TOKEN_FILE, token);
    player.init(token, devToken);
});

// Auto-start if token exists
if (fs.existsSync(TOKEN_FILE)) {
    const savedToken = fs.readFileSync(TOKEN_FILE, 'utf-8');
    player.init(savedToken, devToken);
}

console.log("Running");

// Handle Ctrl+C
process.on('SIGINT', async () => {
    console.log("Shutting down...");
    // If you exposed the browser object, close it here
    process.exit(0);
});