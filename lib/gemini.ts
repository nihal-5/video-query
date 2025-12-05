import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeImage(
    imageData: string,
    query: string
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp'
        });

        const result = await model.generateContent([
            query,
            {
                inlineData: {
                    data: imageData,
                    mimeType: 'image/jpeg'
                }
            }
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('Failed to analyze image with AI');
    }
}

export async function analyzeImageWithContext(
    imageData: string,
    query: string,
    cameraName?: string
): Promise<{
    answer: string;
    confidence: string;
    timestamp: string;
}> {
    try {
        const contextualQuery = cameraName
            ? `You are analyzing a live camera feed from ${cameraName}. ${query}\n\nProvide a detailed, accurate answer based on what you see in the image.`
            : query;

        const answer = await analyzeImage(imageData, contextualQuery);

        return {
            answer,
            confidence: 'High', // Gemini doesn't provide confidence scores directly
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        throw error;
    }
}
