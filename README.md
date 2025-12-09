# AI Video Query System

A real-time video analytics application built with Next.js that allows users to query video content using natural language. Supports YouTube live streams, video files, and webcam feeds with AI-powered analysis using Google's Gemini API.

## 🚀 Live Demo

**[View in AI Portfolio Dashboard](https://unharmable-threadlike-ruth.ngrok-free.dev)** | **[Direct Access](https://unharmable-threadlike-ruth.ngrok-free.dev:3000)**

> Part of **[Nihal's AI Portfolio](https://unharmable-threadlike-ruth.ngrok-free.dev)** - Unified dashboard featuring 5 cutting-edge AI services

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Gemini API](https://img.shields.io/badge/Gemini-2.0%20Flash-purple)

## Features

- **AI-Powered Analysis** - Gemini 2.0 Flash for video understanding
- **Multiple Input Sources**
  - YouTube live streams
  - Video file uploads
  - Webcam capture
- **Natural Language Queries** - Ask questions in plain English
- **Real-Time Object Detection** - COCO-SSD model for live object detection
- **Advanced Computer Vision** - Face detection, hand tracking, and pose estimation
- **Session Analytics** - Track and export detection data

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation

1. Clone the repository
```bash
git clone https://github.com/nihal-5/video-query.git
cd video-query
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Add your Gemini API key to `.env.local`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI/ML**: 
  - Google Gemini 2.0 Flash API
  - TensorFlow.js with COCO-SSD
  - MediaPipe for advanced detection
- **UI Components**: Framer Motion, Lucide React

## Project Structure

```
video-query/
├── app/
│   ├── api/query/        # API endpoint for AI queries
│   ├── page.tsx          # Main application page
│   └── layout.tsx        # Root layout
├── components/
│   ├── VideoSelector.tsx
│   ├── LiveYouTubeStream.tsx
│   ├── WebcamCapture.tsx
│   ├── QueryInterface.tsx
│   ├── SessionManager.tsx
│   └── AdvancedSessionManager.tsx
├── hooks/
│   ├── useObjectDetection.ts
│   ├── useHandTracking.ts
│   └── useAdvancedFaceDetection.ts
└── lib/
    ├── gemini.ts         # Gemini API client
    └── publicCameras.ts  # Camera configurations
```

## Usage

### Query Live Streams
1. Select "Live YouTube Stream" mode
2. Paste a YouTube live stream URL
3. Ask questions about the video content

### Upload Videos
1. Select "YouTube Videos" mode
2. Upload a video file or paste a YouTube URL
3. Pause at any frame and ask questions

### Use Webcam
1. Select "Your Webcam" mode
2. Allow camera permissions
3. Real-time object detection and analysis

### Example Queries
- "What objects are visible in this frame?"
- "How many people can you see?"
- "Describe the current scene"
- "What is happening in the video?"

## API Reference

### Query Endpoint

**POST** `/api/query`

Request body:
```json
{
  "imageData": "base64_encoded_image",
  "query": "What do you see?",
  "cameraName": "Source name"
}
```

Response:
```json
{
  "result": "AI-generated description..."
}
```

## Development

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

Run linter:
```bash
npm run lint
```

## License

MIT License - Free to use for personal and educational purposes

## Author

Nihal Gupta  
GitHub: [@nihal-5](https://github.com/nihal-5)  
Location: Raleigh/Cary, NC

## Acknowledgments

- Google Gemini AI for powerful video understanding capabilities
- TensorFlow.js team for COCO-SSD model
- Next.js team for the framework
