'use client';

import { useEffect, useRef } from 'react';
import { useObjectDetection } from '@/hooks/useObjectDetection';
import { useAdvancedFaceDetection } from '@/hooks/useAdvancedFaceDetection';
import { useHandTracking } from '@/hooks/useHandTracking';
import { Play, Square, Download, TrendingUp, Eye, Smile, Hand } from 'lucide-react';

interface AdvancedSessionManagerProps {
    videoElement: HTMLVideoElement | null;
    onSessionSummary: (summary: string) => void;
}

export default function AdvancedSessionManager({
    videoElement,
    onSessionSummary
}: AdvancedSessionManagerProps) {
    const {
        isLoading: objectsLoading,
        isDetecting: objectsDetecting,
        detections,
        stats: objectStats,
        startDetection: startObjects,
        stopDetection: stopObjects,
        getDetectionSummary,
        exportSession
    } = useObjectDetection();

    const {
        modelsLoaded: faceModelsLoaded,
        isDetecting: facesDetecting,
        faces,
        stats: faceStats,
        startDetection: startFaces,
        stopDetection: stopFaces,
        getSummary: getFaceSummary
    } = useAdvancedFaceDetection();

    const {
        isReady: handsReady,
        isDetecting: handsDetecting,
        hands,
        gestureStats,
        startDetection: startHands,
        stopDetection: stopHands
    } = useHandTracking();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isSessionActive = objectsDetecting || facesDetecting || handsDetecting;

    // Draw ALL detections on canvas
    useEffect(() => {
        if (!canvasRef.current || !videoElement) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match canvas size
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw object detections (blue boxes)
        detections.forEach(detection => {
            const [x, y, width, height] = detection.bbox;

            ctx.strokeStyle = '#3b82f6'; // Blue
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x, y - 20, width, 20);

            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText(`${detection.class} ${Math.round(detection.score * 100)}%`, x + 5, y - 5);
        });

        // Draw face detections (green boxes with emotions)
        faces.forEach(face => {
            const { box, id, dominantEmotion, age, gender } = face;

            ctx.strokeStyle = '#10b981'; // Green
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Label background
            const label = `Person #${id} - ${dominantEmotion}`;
            const labelWidth = ctx.measureText(label).width + 10;
            ctx.fillStyle = '#10b981';
            ctx.fillRect(box.x, box.y - 50, labelWidth, 50);

            // Person ID and emotion
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`Person #${id}`, box.x + 5, box.y - 30);
            ctx.font = '12px Arial';
            ctx.fillText(`${dominantEmotion} ${age ? `(${Math.round(age)}y, ${gender})` : ''}`, box.x + 5, box.y - 10);
        });

        // Draw hand detections (yellow/orange)
        hands.forEach(hand => {
            if (!hand.landmarks || hand.landmarks.length === 0) return;

            // Draw hand landmarks
            hand.landmarks.forEach((landmark, idx) => {
                const x = landmark.x * canvas.width;
                const y = landmark.y * canvas.height;

                ctx.fillStyle = '#f59e0b'; // Orange
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            });

            // Draw gesture label
            const wrist = hand.landmarks[0];
            const x = wrist.x * canvas.width;
            const y = wrist.y * canvas.height;

            const label = `${hand.handedness}: ${hand.gesture}`;
            const labelWidth = ctx.measureText(label).width + 10;

            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(x, y - 30, labelWidth, 25);

            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(label, x + 5, y - 10);
        });

    }, [detections, faces, hands, videoElement]);

    const handleStartAll = () => {
        if (!videoElement) return;

        startObjects(videoElement, 1000);
        if (faceModelsLoaded) startFaces(videoElement, 500);
        if (handsReady) startHands(videoElement, 100);
    };

    const handleStopAll = () => {
        stopObjects();
        stopFaces();
        stopHands();
    };

    const handleGenerateSummary = () => {
        const objectSummary = getDetectionSummary();
        const faceSummary = getFaceSummary();

        const summaryText = `
🎯 Complete Session Analytics:

📦 Objects Detected:
${JSON.stringify(objectSummary.objectCounts, null, 2)}

👤 People Analysis:
- Unique People: ${faceSummary.uniquePeople}
- Total Face Detections: ${faceSummary.totalDetections}
- Current People in Frame: ${faceSummary.currentFaces}

😊 Emotions:
${JSON.stringify(faceSummary.emotions, null, 2)}

🤝 Interactions:
${faceSummary.interactions.join('\n')}

✋ Gestures Detected:
${JSON.stringify(gestureStats, null, 2)}

⏱️ Session Duration: ${objectSummary.sessionDuration}
    `.trim();

        onSessionSummary(summaryText);
    };

    return (
        <div className="space-y-4">
            {/* Detection Overlay Canvas */}
            {isSessionActive && (
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                />
            )}

            {/* Controls */}
            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                            Advanced Computer Vision Suite
                        </h3>
                        {objectsLoading ? (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                <p className="text-yellow-400 text-sm font-medium">
                                    Loading AI models... (this may take 10-30 seconds on first load)
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm mt-1">
                                Object detection • Person tracking • Real-time analytics
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {!isSessionActive ? (
                            <button
                                onClick={handleStartAll}
                                disabled={objectsLoading || !faceModelsLoaded || !handsReady || !videoElement}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all"
                            >
                                <Play className="w-4 h-4" />
                                Start Advanced Session
                            </button>
                        ) : (
                            <button
                                onClick={handleStopAll}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg font-medium transition-all"
                            >
                                <Square className="w-4 h-4" />
                                Stop Session
                            </button>
                        )}
                    </div>
                </div>

                {/* Real-time Stats Dashboard */}
                {isSessionActive && (
                    <div className="space-y-4 pt-4 border-t border-gray-700">
                        {/* Faces & Emotions */}
                        <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Smile className="w-5 h-5 text-green-500" />
                                <h4 className="text-white font-medium">Face Analysis</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{faceStats.uniquePeople}</p>
                                    <p className="text-xs text-gray-400">Unique People</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{faces.length}</p>
                                    <p className="text-xs text-gray-400">In Frame Now</p>
                                </div>
                                {Object.entries(faceStats.emotions).slice(0, 2).map(([emotion, count]) => (
                                    <div key={emotion} className="text-center">
                                        <p className="text-2xl font-bold text-white">{count}</p>
                                        <p className="text-xs text-gray-400 capitalize">{emotion}</p>
                                    </div>
                                ))}
                            </div>
                            {faceStats.interactions.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-green-500/30">
                                    <p className="text-sm text-green-300">
                                        🤝 {faceStats.interactions[faceStats.interactions.length - 1]}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Hand Gestures */}
                        {hands.length > 0 && (
                            <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <Hand className="w-5 h-5 text-orange-500" />
                                    <h4 className="text-white font-medium">Hand Gestures</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {hands.map((hand, idx) => (
                                        <div key={idx} className="p-3 bg-gray-900/50 rounded-lg">
                                            <p className="text-white font-semibold">{hand.handedness} Hand</p>
                                            <p className="text-orange-300 text-sm">{hand.gesture}</p>
                                            <p className="text-gray-400 text-xs">Fingers: {hand.fingerCount}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Objects */}
                        {Object.keys(objectStats).length > 0 && (
                            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <Eye className="w-5 h-5 text-blue-500" />
                                    <h4 className="text-white font-medium">Objects Detected</h4>
                                </div>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    {Object.entries(objectStats).slice(0, 6).map(([object, count]) => (
                                        <div key={object} className="p-2 bg-gray-900/50 rounded text-center">
                                            <p className="text-white text-lg font-bold">{count}</p>
                                            <p className="text-xs text-gray-400 truncate">{object}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                {isSessionActive && (
                    <div className="flex gap-2 pt-4 border-t border-gray-700">
                        <button
                            onClick={handleGenerateSummary}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Get AI Summary
                        </button>
                        <button
                            onClick={exportSession}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export All Data
                        </button>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg">
                <p className="text-purple-200 text-sm">
                    <strong>🚀 Advanced Features Active:</strong> Person tracking with IDs • Emotion recognition (happy, sad, angry, etc.) • Hand gesture detection (peace, thumbs up, etc.) • Finger counting • Interaction detection (two people smiling)
                </p>
            </div>
        </div>
    );
}
