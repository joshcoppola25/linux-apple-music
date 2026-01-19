import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { PORT } from './config';
import { MusicPlayer } from './player';

export function createServer(player: MusicPlayer, devToken: string, onTokenReceived: (token: string) => void) {
    const server = http.createServer((req, res) => {
        if (req.url === '/auth') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <script src="https://js-cdn.music.apple.com/musickit/v3/musickit.js" data-web-components async></script>
                </head>
                <body style="font-family:sans-serif; text-align:center; padding:20px;">
                    <h2>Apple Music Remote</h2>
                    <button id="login" style="padding:20px; width:100%; font-size:20px; background:#007AFF; color:white; border:none; border-radius:10px;">
                        Login / Re-auth
                    </button>
                    <p id="status">Waiting for MusicKit...</p>
                    <div id="player" style="margin-top:30px; display:none;">
                        <h3 id="track">Loading Player...</h3>
                        <button onclick="send('play')" style="padding:10px 20px;">Play</button>
                        <button onclick="send('pause')" style="padding:10px 20px;">Pause</button>
                    </div>
                    <script>
                        const init = setInterval(() => {
                            if (window.MusicKit) {
                                clearInterval(init);
                                MusicKit.configure({ developerToken: '${devToken}', app: {name: 'Remote'} });
                                status.innerText = "MusicKit Ready";
                                document.getElementById('login').onclick = async () => {
                                    status.innerText = "Opening Apple Login...";
                                    const music = MusicKit.getInstance();
                                    try {
                                        const token = await music.authorize();
                                        status.innerText = "Token received! Starting Player...";
                                        fetch('/save-token?token=' + encodeURIComponent(token));
                                    } catch (e) {
                                        status.innerText = "Error: " + e.message;
                                    }
                                };
                            }
                        }, 500);
                    </script>
                </body>
            </html>`);
        } else if (req.url?.startsWith('/save-token')) {
            const token = new URLSearchParams(req.url.split('?')[1]).get('token');
            if (token) onTokenReceived(token);
            res.end("OK");
        }
    });
    server.listen(3000, '0.0.0.0', () => {
        console.log("🌐 Server listening on http://localhost:3000");
    });

    return {server};
}