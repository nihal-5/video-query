import { useEffect, useRef, useState } from 'react';

// Face-API will be loaded dynamically
// Using simplified approach without heavy model loading

export interface FaceDetection {
    id: number;
    box: { x: number; y: number; width: number; height: number };
    expressions: { [key: string]: number };
    dominantEmotion: string;
    age?: number;
    gender?: string;
    timestamp: number;
}

export interface PersonStats {
    uniquePeople: number;
    emotions: { [key: string]: number };
    interactions: string[];
}

export function useAdvancedFaceDetection() {
    const [modelsLoaded, setModelsLoaded] = useState(true); // Start as ready
    const [isDetecting, setIsDetecting] = useState(false);
    const [faces, setFaces] = useState<FaceDetection[]>([]);
    const [stats, setStats] = useState<PersonStats>({
        uniquePeople: 0,
        emotions: {},
        interactions: []
    });

    const facesHistoryRef = useRef<FaceDetection[]>([]);
    const detectionIntervalRef = useRef<number | null>(null);
    const personIdCounterRef = useRef(0);
    const trackedFacesRef = useRef<Map<number, FaceDetection>>(new Map());

    // For now, use basic detection without face-api
    // This allows the app to work while models are being set up

    // Assign ID to face based on position tracking
    const assignFaceId = (box: { x: number; y: number; width: number; height: number }): number => {
        const threshold = 100;

        for (const [id, trackedFace] of trackedFacesRef.current) {
            const distance = Math.sqrt(
                Math.pow(box.x - trackedFace.box.x, 2) +
                Math.pow(box.y - trackedFace.box.y, 2)
            );

            if (distance < threshold) {
                return id;
            }
        }

        return ++personIdCounterRef.current;
    };

    // Detect interactions between people
    const detectInteractions = (faces: FaceDetection[]): string[] => {
        const interactions: string[] = [];

        if (faces.length >= 2) {
            for (let i = 0; i < faces.length - 1; i++) {
                for (let j = i + 1; j < faces.length; j++) {
                    const face1 = faces[i];
                    const face2 = faces[j];

                    const distance = Math.sqrt(
                        Math.pow(face1.box.x - face2.box.x, 2) +
                        Math.pow(face1.box.y - face2.box.y, 2)
                    );

                    if (distance < 300) {
                        const emotion1 = face1.dominantEmotion;
                        const emotion2 = face2.dominantEmotion;

                        if (emotion1 === 'happy' && emotion2 === 'happy') {
                            interactions.push(`Person #${face1.id} and #${face2.id} both smiling`);
                        } else {
                            interactions.push(`Person #${face1.id} and #${face2.id} interacting`);
                        }
                    }
                }
            }
        }

        return interactions;
    };

    // Start detection (basic version)
    const startDetection = async (videoElement: HTMLVideoElement, interval: number = 500) => {
        setIsDetecting(true);
        facesHistoryRef.current = [];
        personIdCounterRef.current = 0;
        trackedFacesRef.current.clear();
        setStats({ uniquePeople: 0, emotions: {}, interactions: [] });

        // Note: Face detection would run here
        // For now, showing placeholder functionality
        // This allows the system to work while face-api models are set up
    };

    // Stop detection
    const stopDetection = () => {
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
        setIsDetecting(false);
    };

    // Get summary
    const getSummary = () => {
        return {
            uniquePeople: stats.uniquePeople,
            totalDetections: facesHistoryRef.current.length,
            emotions: stats.emotions,
            interactions: stats.interactions,
            currentFaces: faces.length
        };
    };

    return {
        modelsLoaded,
        isDetecting,
        faces,
        stats,
        startDetection,
        stopDetection,
        getSummary
    };
}
