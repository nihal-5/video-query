import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export interface Detection {
    class: string;
    score: number;
    bbox: [number, number, number, number];
    timestamp: number;
}

export interface DetectionStats {
    [key: string]: number;
}

export function useObjectDetection() {
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [detections, setDetections] = useState<Detection[]>([]);
    const [stats, setStats] = useState<DetectionStats>({});
    const [isDetecting, setIsDetecting] = useState(false);

    const detectionHistoryRef = useRef<Detection[]>([]);
    const detectionIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        async function loadModel() {
            try {
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading model:', error);
                setIsLoading(false);
            }
        }
        loadModel();
    }, []);

    // Start detection session
    const startDetection = (
        videoElement: HTMLVideoElement | HTMLImageElement,
        interval: number = 1000
    ) => {
        if (!model || isDetecting) return;

        setIsDetecting(true);
        detectionHistoryRef.current = [];
        setStats({});

        const detect = async () => {
            try {
                const predictions = await model.detect(videoElement);
                const timestamp = Date.now();

                const newDetections: Detection[] = predictions.map(pred => ({
                    class: pred.class,
                    score: pred.score,
                    bbox: pred.bbox,
                    timestamp
                }));


                detectionHistoryRef.current = [
                    ...detectionHistoryRef.current,
                    ...newDetections
                ];


                if (detectionHistoryRef.current.length > 1000) {
                    detectionHistoryRef.current = detectionHistoryRef.current.slice(-1000);
                }


                const newStats = { ...stats };
                newDetections.forEach(det => {
                    newStats[det.class] = (newStats[det.class] || 0) + 1;
                });

                setDetections(newDetections);
                setStats(newStats);
            } catch (error) {
                console.error('Detection error:', error);
            }
        };


        detectionIntervalRef.current = window.setInterval(detect, interval);
        detect();
    };

    // Stop detection session
    const stopDetection = () => {
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
        setIsDetecting(false);
    };

    // Get detection summary for Gemini
    const getDetectionSummary = (timeRangeMinutes?: number) => {
        const history = detectionHistoryRef.current;

        let filteredHistory = history;
        if (timeRangeMinutes) {
            const cutoffTime = Date.now() - (timeRangeMinutes * 60 * 1000);
            filteredHistory = history.filter(d => d.timestamp >= cutoffTime);
        }

        const summary = filteredHistory.reduce((acc, det) => {
            acc[det.class] = (acc[det.class] || 0) + 1;
            return acc;
        }, {} as DetectionStats);

        const timeline = filteredHistory.map(d => ({
            time: new Date(d.timestamp).toLocaleTimeString(),
            object: d.class,
            confidence: Math.round(d.score * 100)
        }));

        return {
            totalDetections: filteredHistory.length,
            objectCounts: summary,
            timeline: timeline.slice(-50),
            timeRange: timeRangeMinutes ? `${timeRangeMinutes} minutes` : 'entire session',
            sessionDuration: history.length > 0
                ? Math.round((Date.now() - history[0].timestamp) / 60000) + ' minutes'
                : '0 minutes'
        };
    };

    // Export session data
    const exportSession = () => {
        const data = {
            detections: detectionHistoryRef.current,
            stats,
            summary: getDetectionSummary()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detection-session-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return {
        model,
        isLoading,
        isDetecting,
        detections,
        stats,
        startDetection,
        stopDetection,
        getDetectionSummary,
        exportSession,
        detectionHistory: detectionHistoryRef.current
    };
}
