'use client';

import { useState } from 'react';
import WebcamCapture from '@/components/WebcamCapture';
import VideoSelector from '@/components/VideoSelector';
import LiveYouTubeStream from '@/components/LiveYouTubeStream';
import QueryInterface from '@/components/QueryInterface';
import { Video, Radio, Camera } from 'lucide-react';

type SourceType = 'video' | 'live' | 'webcam';
type VideoType = 'file' | 'youtube';

export default function Home() {
  const [sourceType, setSourceType] = useState<SourceType>('live');
  const [videoInfo, setVideoInfo] = useState<{ url: string, type: VideoType } | null>(null);

  const handleVideoSelect = (url: string, type: VideoType) => {
    setVideoInfo({ url, type });
  };

  const handleQuery = async (query: string) => {
    try {
      let imageData: string;

      if (sourceType === 'live') {
        const iframe = document.querySelector('iframe[src*="youtube.com/embed"]') as HTMLIFrameElement;

        if (iframe) {
          const srcMatch = iframe.src.match(/embed\/([^?]+)/);
          if (srcMatch) {
            const videoId = srcMatch[1];
            const response = await fetch(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];

                const apiResponse = await fetch('/api/query', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    imageData: base64,
                    query,
                    cameraName: 'Live YouTube Stream'
                  }),
                });

                if (!apiResponse.ok) {
                  const error = await apiResponse.json();
                  throw new Error(error.error || 'Query failed');
                }

                const data = await apiResponse.json();
                resolve(data.result);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        }
        throw new Error('No live stream loaded. Please paste a YouTube URL first.');

      } else if (sourceType === 'webcam') {
        const videoElement = document.querySelector('video[autoplay]') as HTMLVideoElement;
        if (!videoElement) throw new Error('Webcam not active');

        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        ctx.drawImage(videoElement, 0, 0);
        imageData = canvas.toDataURL('image/jpeg').split(',')[1];

      } else {
        if (videoInfo?.type === 'youtube') {
          const response = await fetch(`https://i.ytimg.com/vi/${videoInfo.url}/maxresdefault.jpg`);
          const blob = await response.blob();

          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64 = (reader.result as string).split(',')[1];

              const apiResponse = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageData: base64,
                  query,
                  cameraName: 'YouTube Video'
                }),
              });

              if (!apiResponse.ok) {
                const error = await apiResponse.json();
                throw new Error(error.error || 'Query failed');
              }

              const data = await apiResponse.json();
              resolve(data.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          const videoElement = document.querySelector('video[controls]') as HTMLVideoElement;
          if (!videoElement) throw new Error('No video loaded');

          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Failed to get canvas context');
          ctx.drawImage(videoElement, 0, 0);
          imageData = canvas.toDataURL('image/jpeg').split(',')[1];
        }
      }

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          query,
          cameraName: sourceType.toUpperCase()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Query failed');
      }

      const data = await response.json();
      return data.result;

    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            🎥 AI Video Query System
          </h1>
          <p className="text-gray-300 text-lg">
            Ask questions about videos, live streams, or webcam in natural language
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setSourceType('video')}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 ${sourceType === 'video'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
          >
            <Video className="w-5 h-5" />
            <span>YouTube Videos</span>
          </button>

          <button
            onClick={() => setSourceType('live')}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 ${sourceType === 'live'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
          >
            <Radio className="w-5 h-5" />
            <span>Live YouTube Stream</span>
          </button>

          <button
            onClick={() => setSourceType('webcam')}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all transform hover:scale-105 ${sourceType === 'webcam'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
              }`}
          >
            <Camera className="w-5 h-5" />
            <span>Your Webcam</span>
          </button>
        </div>

        {sourceType === 'video' && (
          <VideoSelector onVideoSelect={handleVideoSelect} />
        )}

        {sourceType === 'live' && (
          <LiveYouTubeStream />
        )}

        {sourceType === 'webcam' && (
          <WebcamCapture />
        )}

        <QueryInterface onQuery={handleQuery} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="text-3xl mb-3">📡</div>
            <h3 className="text-white font-semibold mb-2">Live Streams</h3>
            <p className="text-gray-400 text-sm">
              Paste any YouTube live stream URL and query it
            </p>
          </div>
          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-400 text-sm">
              Gemini 2.0 Flash for accurate image understanding
            </p>
          </div>
          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-white font-semibold mb-2">Natural Language</h3>
            <p className="text-gray-400 text-sm">
              Ask questions in plain English, get instant answers
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
