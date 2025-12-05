'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import AdvancedSessionManager from '@/components/AdvancedSessionManager';

export default function WebcamCapture() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [sessionSummary, setSessionSummary] = useState<string>('');

    const startWebcam = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            setStream(mediaStream);
            setIsActive(true);
            setError(null);
        } catch (err) {
            console.error('Webcam error:', err);
            setError('Unable to access webcam. Please check permissions.');
            setIsActive(false);
        }
    };

    const stopWebcam = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsActive(false);
        }
    };

    useEffect(() => {
        startWebcam();

        return () => {
            stopWebcam();
        };
    }, []);

    const handleSessionSummary = (summary: string) => {
        setSessionSummary(summary);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl">
                {error ? (
                    <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center p-8">
                        <CameraOff className="w-16 h-16 text-gray-600 mb-4" />
                        <p className="text-gray-400 text-center mb-4">{error}</p>
                        <button
                            onClick={startWebcam}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-auto"
                        />

                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg z-20">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-white text-sm font-medium">LIVE WEBCAM</span>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={isActive ? stopWebcam : startWebcam}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                >
                                    {isActive ? (
                                        <>
                                            <CameraOff className="w-4 h-4 text-white" />
                                            <span className="text-white text-sm">Stop Camera</span>
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-4 h-4 text-white" />
                                            <span className="text-white text-sm">Start Camera</span>
                                        </>
                                    )}
                                </button>
                                <span className="text-white text-sm font-medium">Advanced CV System</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isActive && videoRef.current && (
                <AdvancedSessionManager
                    videoElement={videoRef.current}
                    onSessionSummary={handleSessionSummary}
                />
            )}

            {sessionSummary && (
                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl">
                    <h4 className="text-purple-300 font-semibold mb-3 text-lg">📊 Complete Session Analytics:</h4>
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
                        {sessionSummary}
                    </pre>
                </div>
            )}
        </div>
    );
}
