export interface TrackUpdate {
    type: 'TRACK_UPDATE';
    title: string;
    artist: string;
    progress?: number;
    artwork?: string;
}

export interface DebugMessage {
    type: 'DEBUG' | 'ERROR';
    msg: string;
}
export interface Playlist {
    id: string;
    name: string;
}

export interface PlaylistResponse {
    type: 'PLAYLISTS_LIST';
    data: Playlist[];
}

export type SocketMessage = TrackUpdate | DebugMessage | PlaylistResponse;

