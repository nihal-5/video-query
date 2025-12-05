'use client';

import { useState } from 'react';
import { Youtube, Upload, Play } from 'lucide-react';

interface VideoSelectorProps {
    onVideoSelect: (url: string, type: 'file' | 'youtube') => void;
}

export default function VideoSelector({ onVideoSelect }: VideoSelectorProps) {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
    const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
    const [inputMode, setInputMode] = useState<'youtube' | 'upload'>('youtube');

    const extractYoutubeId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    const handleYoutubeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const videoId = extractYoutubeId(youtubeUrl);

        if (videoId) {
            setYoutubeVideoId(videoId);
            onVideoSelect(videoId, 'youtube');
        } else {
            alert('Invalid YouTube URL. Please try again.');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            setUploadedVideo(url);
            setYoutubeVideoId(null);
            onVideoSelect(url, 'file');
        }
    };

    const handleReset = () => {
        setYoutubeUrl('');
        setYoutubeVideoId(null);
        if (uploadedVideo) {
            URL.revokeObjectURL(uploadedVideo);
            setUploadedVideo(null);
        }
    };

    if (youtubeVideoId) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                        💡 <strong>Tip:</strong> Pause at any moment and ask a question about that frame
                    </p>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                    >
                        Change Video
                    </button>
                </div>
            </div>
        );
    }

    if (uploadedVideo) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl">
                    <video
                        src={uploadedVideo}
                        controls
                        className="w-full h-auto"
                    >
                        Your browser doesn't support video playback.
                    </video>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                        💡 <strong>Tip:</strong> Pause at any moment and ask a question about that frame
                    </p>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                    >
                        Change Video
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="flex gap-3 justify-center">
                <button
                    onClick={() => setInputMode('youtube')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${inputMode === 'youtube'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    <Youtube className="w-5 h-5" />
                    YouTube URL
                </button>
                <button
                    onClick={() => setInputMode('upload')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${inputMode === 'upload'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    <Upload className="w-5 h-5" />
                    Upload File
                </button>
            </div>

            {inputMode === 'youtube' && (
                <form onSubmit={handleYoutubeSubmit} className="space-y-4">
                    <div className="p-8 bg-gradient-to-br from-red-900/20 to-gray-800/50 border-2 border-red-600/30 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Youtube className="w-8 h-8 text-red-500" />
                            <h3 className="text-white font-semibold text-lg">Paste YouTube URL</h3>
                        </div>

                        <input
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        <button
                            type="submit"
                            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Play className="w-5 h-5" />
                            Load Video
                        </button>

                        <p className="mt-4 text-gray-400 text-sm text-center">
                            Works with: youtube.com/watch?v=... or youtu.be/...
                        </p>
                    </div>
                </form>
            )}

            {inputMode === 'upload' && (
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 bg-gray-800/30 hover:border-blue-500 transition-colors">
                    <label className="cursor-pointer flex flex-col items-center">
                        <Upload className="w-16 h-16 text-gray-400 mb-4" />
                        <span className="text-white font-medium text-lg mb-2">Upload Your Video</span>
                        <span className="text-gray-400 mb-4">Click to browse or drag and drop</span>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <span className="text-sm text-gray-500">MP4, WebM, MOV (max 500MB)</span>
                    </label>
                </div>
            )}
        </div>
    );
}
