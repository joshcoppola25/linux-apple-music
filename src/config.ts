import path from 'path';
import fs from 'fs';

export const PORT = 3000;
export const TOKEN_FILE = path.resolve(__dirname, '../token.txt');
export const SESSION_PATH = path.resolve(__dirname, '../ipod_user_data');
import { fetchFreshDevToken } from './tokenUtils';

export const getDevToken = (): string => {
    if (fs.existsSync(TOKEN_FILE)) {
        const cachedToken = fs.readFileSync(TOKEN_FILE, 'utf-8').trim();
        if (cachedToken.length > 0) {
            console.log("💾 Using cached Developer Token from file.");
            return cachedToken;
        }
    }

    const freshToken = fetchFreshDevToken();
    
    fs.writeFileSync(TOKEN_FILE, freshToken);
    return freshToken;
};

export const PUPPETEER_CONFIG = {
  executablePath: '/usr/bin/chromium-browser',
  headless: true,
  args: ['--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--use-gl=swiftshader',
    '--autoplay-policy=no-user-gesture-required',
    '--no-user-gesture-required',
    '--no-proxy-server',
    '--mute-audio',
    '--proxy-server="direct://"',
    '--disable-features=AudioServiceSandbox', 
    '--proxy-bypass-list=*',
    '--disable-web-security',
    '--alsa-output-device=hw:0,0', 
    '--disable-features=IsolateOrigins,site-per-process',
    '--widevine-cdm-path=/opt/WidevineCdm/gmp-widevinecdm/latest',
    '--widevine-cdm-version=4.10.2662.3',
    '--disable-features=PreloadMediaEngagementData, AutoplayIgnoreWebAudio',
    '--log-level=0',
    '--enable-logging=stderr',
    '--enable-audio-service-sandbox=false',
    '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  ]
};
