import fs from 'fs';
import readline from 'readline';
import { MusicPlayer } from './player';
import { TOKEN_FILE, getDevToken } from './config';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'AM-CLI> '
});

const player = new MusicPlayer((data) => {
    if (data.type === 'TRACK_UPDATE') {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        console.log(`🎵 ${data.title} - ${data.artist} (${Math.round(data.progress ?? 0)}%)`);
        rl.prompt(true);
    }
});

async function start() {
    console.log("🚀 Initializing Apple Music CLI...");
    const token = fs.readFileSync(TOKEN_FILE, 'utf-8');
    await player.init(token, getDevToken());

    console.log("\n--- COMMANDS ---");
    console.log("play <id> : Play song by ID");
    console.log("pause     : Toggle play/pause");
    console.log("exit      : Close player");
    console.log("----------------\n");

    rl.prompt();

    rl.on('line', async (line) => {
        const [command, arg] = line.trim().split(' ');

        switch (command.toLowerCase()) {
            case 'play':
                if (arg) await player.playSong(arg);
                else console.log("Missing Song ID");
                break;
            case 'pause':
                await player.togglePause();
                break;
            case 'exit':
                console.log("Exiting");
                process.exit(0);
                break;
            default:
                console.log(`Unknown command: ${command}`);
                break;
        }
        rl.prompt();
    });
}

start();