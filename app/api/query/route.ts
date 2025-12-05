import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithContext } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const { imageData, query, cameraName, sessionData } = await req.json();

        // Validation
        if (!query) {
            return NextResponse.json(
                { error: 'Missing required field: query' },
                { status: 400 }
            );
        }

        if (typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json(
                { error: 'Query must be a non-empty string' },
                { status: 400 }
            );
        }

        let result;

        // Check if this is a session analytics query (no image, just detection data)
        if (sessionData && !imageData) {
            // Text-only query with session data
            const contextualQuery = `
You are analyzing real-time object detection data from a video surveillance system.

Session Data:
${JSON.stringify(sessionData, null, 2)}

User Question: ${query}

Please provide a detailed, accurate answer based on the detection data provided.
      `.trim();

            // Use Gemini for text analysis (much cheaper than image analysis)
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

            const aiResult = await model.generateContent(contextualQuery);
            const response = await aiResult.response;

            result = {
                answer: response.text(),
                confidence: 'High',
                timestamp: new Date().toISOString()
            };
        } else if (imageData) {
            // Standard image + query analysis
            result = await analyzeImageWithContext(
                imageData,
                query,
                cameraName
            );
        } else {
            return NextResponse.json(
                { error: 'Must provide either imageData or sessionData' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            result
        });

    } catch (error) {
        console.error('API Route Error:', error);

        return NextResponse.json(
            {
                error: 'Failed to process query',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
