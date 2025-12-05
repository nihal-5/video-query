'use client';

import { useState } from 'react';
import { Youtube, Play, ExternalLink } from 'lucide-react';

export default function LiveYouTubeStream() {
    const [inputUrl, setInputUrl] = useState('');
    const [videoId, setVideoId] = useState<string | null>(null);

    const extractVideoId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = extractVideoId(inputUrl);

        if (id) {
            setVideoId(id);
        } else {
            alert('Invalid YouTube URL. Please try again.');
        }
    };

    const handleReset = () => {
        setInputUrl('');
        setVideoId(null);
    };

    if (videoId) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Live YouTube Stream"
                    />

                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg pointer-events-none z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-white text-sm font-medium">LIVE STREAM</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <a
                        href={`https://www.youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Open in YouTube
                    </a>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                    >
                        Change Stream
                    </button>
                </div>

                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 text-sm">
                        <strong>✅ Streaming Live:</strong> Ask questions about what you see in the video!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-8 bg-gradient-to-br from-red-900/20 to-gray-800/50 border-2 border-red-600/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Youtube className="w-8 h-8 text-red-500" />
                        <h3 className="text-white font-semibold text-lg">Paste YouTube Live Stream URL</h3>
                    </div>

                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://www.youtube.com/live/..."
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />

                    <button
                        type="submit"
                        className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Play className="w-5 h-5" />
                        Start Live Stream
                    </button>

                    <div className="mt-4 space-y-2">
                        <p className="text-gray-400 text-sm text-center">
                            Works with YouTube live streams and regular videos
                        </p>
                        <p className="text-gray-500 text-xs text-center">
                            Example: https://www.youtube.com/live/VR-x3HdhKLQ
                        </p>
                    </div>
                </div>
            </form>

            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm mb-2">
                    <strong>💡 How to find live streams:</strong>
                </p>
                <ul className="text-gray-400 text-sm space-y-1 ml-4">
                    <li>• Search YouTube for "live camera 24/7"</li>
                    <li>• Search for your city + "live stream"</li>
                    <li>• Look for red "LIVE" badge on videos</li>
                </ul>
            </div>
        </div>
    );
}
