'use client';

import { useEffect, useRef } from 'react';
import { useObjectDetection, Detection } from '@/hooks/useObjectDetection';
import { Play, Square, Download, TrendingUp, Eye } from 'lucide-react';

interface SessionManagerProps {
    videoElement: HTMLVideoElement | HTMLImageElement | null;
    onSessionSummary: (summary: string) => void;
}

export default function SessionManager({
    videoElement,
    onSessionSummary
}: SessionManagerProps) {
    const {
        isLoading,
        isDetecting,
        detections,
        stats,
        startDetection,
        stopDetection,
        getDetectionSummary,
        exportSession
    } = useObjectDetection();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Draw detection boxes
    useEffect(() => {
        if (!canvasRef.current || !videoElement || detections.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match canvas size to video
        if (videoElement instanceof HTMLVideoElement) {
            canvas.width = videoElement.videoWidth || 640;
            canvas.height = videoElement.videoHeight || 480;
        } else {
            canvas.width = videoElement.naturalWidth || 640;
            canvas.height = videoElement.naturalHeight || 480;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw each detection
        detections.forEach((detection: Detection) => {
            const [x, y, width, height] = detection.bbox;

            // Draw box
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            // Draw label background
            const label = `${detection.class} ${Math.round(detection.score * 100)}%`;
            const textMetrics = ctx.measureText(label);
            const textHeight = 20;

            ctx.fillStyle = '#00ff00';
            ctx.fillRect(x, y - textHeight - 4, textMetrics.width + 10, textHeight + 4);

            // Draw label text
            ctx.fillStyle = '#000';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(label, x + 5, y - 8);
        });
    }, [detections, videoElement]);

    const handleStart = () => {
        if (videoElement) {
            startDetection(videoElement, 1000); // Detect every 1 second
        }
    };

    const handleStop = () => {
        stopDetection();
    };

    const handleGenerateSummary = () => {
        const summary = getDetectionSummary();
        const summaryText = `
Session Analytics:
- Duration: ${summary.sessionDuration}
- Total Detections: ${summary.totalDetections}
- Object Counts: ${JSON.stringify(summary.objectCounts, null, 2)}
- Recent Activity: ${summary.timeline.slice(-10).map(t => `${t.time}: ${t.object}`).join(', ')}
    `.trim();

        onSessionSummary(summaryText);
    };

    return (
        <div className="space-y-4">
            {/* Detection Overlay Container */}
            {isDetecting && canvasRef.current && (
                <div ref={containerRef} className="relative -mt-4">
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                        }}
                    />
                </div>
            )}

            {/* Controls */}
            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Detection Session
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                            {isLoading ? 'Loading AI model...' : 'Real-time object detection with YOLO/COCO-SSD'}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {!isDetecting ? (
                            <button
                                onClick={handleStart}
                                disabled={isLoading || !videoElement}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                            >
                                <Play className="w-4 h-4" />
                                Start Session
                            </button>
                        ) : (
                            <button
                                onClick={handleStop}
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <Square className="w-4 h-4" />
                                Stop Session
                            </button>
                        )}
                    </div>
                </div>

                {/* Detection Status */}
                {isDetecting && (
                    <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-green-300 text-sm">
                            <Eye className="w-4 h-4 animate-pulse" />
                            <strong>Detecting:</strong> {detections.length} objects in current frame
                        </div>
                    </div>
                )}

                {/* Live Stats */}
                {isDetecting && Object.keys(stats).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
                        {Object.entries(stats).slice(0, 8).map(([object, count]) => (
                            <div key={object} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                <p className="text-gray-400 text-xs uppercase truncate">{object}</p>
                                <p className="text-white text-2xl font-bold">{count}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Session Actions */}
                {stats && Object.keys(stats).length > 0 && (
                    <div className="flex gap-2 pt-4 border-t border-gray-700">
                        <button
                            onClick={handleGenerateSummary}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Ask AI About Session
                        </button>

                        <button
                            onClick={exportSession}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Data
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                    <strong>💡 How it works:</strong> Click "Start Session" to begin real-time detection.
                    You'll see green boxes around detected objects (people, cars, etc.) and live counts.
                    Then ask questions like "How many cars were detected?" for AI analysis!
                </p>
            </div>
        </div>
    );
}
