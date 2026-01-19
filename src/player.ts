import puppeteer, { Browser, Page } from 'puppeteer-core';
import { PUPPETEER_CONFIG, SESSION_PATH } from './config';
import { SocketMessage } from './types';

export class MusicPlayer {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private isLaunching = false;

    constructor(private onMessage: (data: SocketMessage) => void) {}

    async init(userToken: string, devToken: string) {
        if (this.isLaunching) {
            console.log('Already running');
            return;
        }
        this.isLaunching = true;

        try {
            if (this.browser) await this.browser.close().catch(() => {});

            this.browser = await puppeteer.launch({
                ...PUPPETEER_CONFIG,
                userDataDir: SESSION_PATH,
                ignoreDefaultArgs: ['--mute-audio', '--disable-audio-output'],
                dumpio: true,
                pipe: true
            });

            this.page = await this.browser.newPage();
            this.page.setDefaultNavigationTimeout(0);

            this.page.on('console', m => console.log("🌐 BROWSER:", m.text()));
            this.page.on('console', m => console.log("🌐 BROWSER:", m.text()));

            this.page.on('pageerror', (err: unknown) => {
                const message = err instanceof Error ? err.message : String(err);
                console.log("❌ BROWSER ERROR:", message);
            });            
            
            await this.page.exposeFunction('notifyNode', (data: SocketMessage) => {
                this.onMessage(data);
            });

            console.log("🔗 Loading local auth page...");
            await this.page.goto(`http://127.0.0.1:3000/auth`, { 
                waitUntil: 'domcontentloaded',
                timeout: 0 
            });

            await new Promise(r => setTimeout(r, 3000));

            console.log("Initializing MusicKit");

            await this.page.evaluate(async (token, devToken) => {
                const notify = (window as any).notifyNode;

                while (!(window as any).MusicKit) {
                    await new Promise(r => setTimeout(r, 500));
                }

                const MK = (window as any).MusicKit;

                await MK.configure({
                    developerToken: devToken,
                    app: { name: 'iPod', build: '1' }
                });

                const music = MK.getInstance();

                music.addEventListener('authorizationStatusDidChange', () => {
                    if (music.authorizationStatus === 0) { // 0 is unauthorized
                        notify({ type: 'ERROR', msg: '401 - Unauthorized' });
                    }
                });

                console.log("Injecting tokens into localStorage and instance");
                music.musicUserToken = token;
                localStorage.setItem('media-user-token', token);
                localStorage.setItem(`music.${devToken}.u`, token);

                try {
                    if (music._didSetUserToken) {
                        await music._didSetUserToken(token);
                    }
                } catch (e: any) {
                    console.log("Internal auth method failed, proceeding anyway");
                }

                await new Promise(r => setTimeout(r, 2000));
                console.log("Auth State:", music.isAuthorized ? "AUTHORIZED" : "NOT AUTHORIZED");

                const forceUnmute = async () => {
                    try {
                        await music.unmute();
                        music.volume = 1.0;
                        if (music.player && music.player.audio) {
                            music.player.audio.muted = false;
                            music.player.audio.volume = 1.0;
                        }
                    } catch (e: any) { console.log("Unmute error:", e.message); }
                };

                await forceUnmute();
                document.body.click();

                setInterval(() => {
                    if (music && music.nowPlayingItem) {
                        const item = music.nowPlayingItem;
                        const duration = music.currentPlaybackDuration || 0;
                        const currentTime = music.currentPlaybackTime || 0;
                        
                        let artwork = "";
                        if (item.assets && item.assets[0]) {
                            artwork = item.assets[0].artworkURL.replace('{w}', '600').replace('{h}', '600');
                        }

                        notify({
                            type: 'TRACK_UPDATE',
                            title: item.title,
                            artist: item.artistName,
                            progress: duration > 0 ? (currentTime / duration) * 100 : 0,
                            artwork: artwork
                        });
                    }
                }, 2000);

            }, userToken, devToken);

            console.log("Player successfully initialized");

        } catch (e: any) {
            console.error("Player Error:", e.message);
        } finally {
            this.isLaunching = false;
        }
    }

      async fetchPlaylists() {
    if (!this.page) return;

    await this.page.evaluate(async () => {
        try {
            const music = (window as any).MusicKit.getInstance();
            let allPlaylists: any[] = [];
            
            let nextUrl = 'v1/me/library/playlists?limit=100';

            while (nextUrl) {
                console.log(`Fetching page: ${nextUrl}`);
                const response: any = await music.api.music(nextUrl);
                
                const rawItems = response.data?.data || [];
                allPlaylists = [...allPlaylists, ...rawItems];

                nextUrl = response.data?.next || null;
            }

            const formatted = allPlaylists
                .filter(item => item && item.attributes)
                .map(item => ({
                    id: item.id,
                    name: item.attributes.name || "Unknown Name"
                }));

            console.log(`Total playlists fetched: ${formatted.length}`);
            (window as any).notifyNode({ type: 'PLAYLISTS_LIST', data: formatted });

        } catch (e: any) {
            console.error("Pagination Error:", e.message);
        }
    });
}
    async playPlaylist(playlistId: string) {
        if (!this.page) return;
        console.log(`Switching to playlist: ${playlistId}`);
        await this.page.evaluate(async (id) => {
            const music = (window as any).MusicKit.getInstance();
            await music.setQueue({ playlist: id });
            await music.play();
        }, playlistId);
    }

    async playSong(songId: string) {
        if (!this.page) return;
        console.log(`Playing Song ID: ${songId}`);
        if(songId === undefined || songId === ""){
            await this.page.evaluate(async (id) => {
            const music = (window as any).MusicKit.getInstance();
            await music.play();
            }, songId);
        }
        else {
            await this.page.evaluate(async (id) => {
                const music = (window as any).MusicKit.getInstance();
                await music.setQueue({ song: id });
                await music.authorize()
                await music.play();
            }, songId);
        }
    }

    async pause() {
        if (!this.page) return;
        console.log(`Pausing...`);
        await this.page.evaluate(() => {
            const music = (window as any).MusicKit.getInstance();
            music.pause();
        });
    }

    async togglePause() {
    if (!this.page) return;
    await this.page.evaluate(() => {
        const music = (window as any).MusicKit.getInstance();
        if (music.isPlaying) {
            music.pause();
            console.log("⏸️ Paused");
        } else {
            music.play();
            console.log("▶️ Playing");
        }
    });
}

    async shutdown() {
        if (this.browser) await this.browser.close();
    }
}