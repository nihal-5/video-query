// Note: YouTube live stream IDs change frequently
// To update: Go to YouTube → Search "location live 24/7" → Copy video ID from URL

export const publicCameras = [
    {
        id: 'youtube-1',
        name: 'Search YouTube for: "Shibuya crossing live 24/7"',
        youtubeId: '', // Leave empty for now - users paste their own
        type: 'youtube' as const,
    },
    {
        id: 'youtube-2',
        name: 'Search YouTube for: "Times Square live 24/7"',
        youtubeId: '',
        type: 'youtube' as const,
    },
    {
        id: 'youtube-3',
        name: 'Search YouTube for: "Tokyo live camera"',
        youtubeId: '',
        type: 'youtube' as const,
    }
];

export type PublicCamera = typeof publicCameras[number];
