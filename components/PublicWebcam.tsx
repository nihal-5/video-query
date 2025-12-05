'use client';

import { useRef, useState, useEffect } from 'react';
import SessionManager from '@/components/SessionManager';

interface PublicWebcamProps {
    youtubeId: string;
    name: string;
}

export default function PublicWebcam({ youtubeId, name }: PublicWebcamProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [proxyVideo, setProxyVideo] = useState<HTMLVideoElement | null>(null);
    const [sessionSummary, setSessionSummary] = useState<string>('');

    // Create hidden video element to capture YouTube stream for detection
    useEffect(() => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.style.display = 'none';
        document.body.appendChild(video);

        // Try to get stream from YouTube thumbnail updates
        const interval = setInterval(() => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg?t=${Date.now()}`;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    video.src = canvas.toDataURL();
                }
            };
        }, 1000);

        setProxyVideo(video);

        return () => {
            clearInterval(interval);
            document.body.removeChild(video);
        };
    }, [youtubeId]);

    const handleSessionSummary = (summary: string) => {
        setSessionSummary(summary);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl aspect-video">
                <iframe
                    ref={iframeRef}
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={name}
                />

                {/* Live Indicator */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg pointer-events-none z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-white text-sm font-medium">LIVE STREAM</span>
                    </div>
                </div>
            </div>

            {/* Session Manager with Detection */}
            <SessionManager
                videoElement={proxyVideo}
                onSessionSummary={handleSessionSummary}
            />

            {/* Session Summary */}
            {sessionSummary && (
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <h4 className="text-green-300 font-semibold mb-2">Session Analytics:</h4>
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                        {sessionSummary}
                    </pre>
                </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <p className="text-green-300 text-sm flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <strong>Real Live CCTV:</strong> {name} - Streaming 24/7 with AI detection
                </p>
            </div>
        </div>
    );
}
