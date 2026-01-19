### This is actively a WIP, only thing working so far is pausing and playing

## COMMAND LINE SETUP

This tool requires a subscription to the Apple Developer program.  You will need to generate a private key, a teamId and a keyId.  [Apple provides a guide on how to obtain these here](https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens).  

This is currently configured to work with ALSA for audio routing to your sound card, only tested to be working on Debian bookwork (DietPi) on a Raspberry Pi 4 at the moment.

You must also have a chromium browser installed

PM2 must also be installed
`$ npm install pm2 -g`

Run `mv .env.example .env` and edit .env with the correct values

Run `npx tsc src/am.ts --outDir dist --module commonjs --esModuleInterop` 

Add the alias to your ~/.bashrc `alias am='ts-node --transpile-only src/am.ts’`

## DAEMON SETUP

An install script is provided to add it as a system service

Make the install script executable `chmod +x scripts/install-service.sh` 

Then run the install script to add the daemon as a system service `npm run install-service`


## RUN

Once running, navigate to `http://<your-ip-address>:3000/auth` on a different device and login to your Apple Music account

From there you can execute the following commands with `am`

`play <songId>` - Plays the song with the given song id

`pause` - Pauses a song

`play` - Plays the song from the paused point

## TODO

- Implement queueing feature
- Play user playlists on shuffle
- Volume controls
- Next/Previous song
- Create a CLI application
- Play song by searching song name & artist
