'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueryResult {
    answer: string;
    confidence: string;
    timestamp: string;
}

interface QueryInterfaceProps {
    onQuery: (query: string) => Promise<QueryResult>;
    sessionData?: any; // Detection session data
    isLoading?: boolean;
}

export default function QueryInterface({
    onQuery,
    sessionData,
    isLoading = false
}: QueryInterfaceProps) {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<QueryResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);

    const suggestedQueries = sessionData ? [
        "How many cars passed in the last 5 minutes?",
        "What was the most common object detected?",
        "How many people were detected total?",
        "What time had the most activity?",
        "Summarize the traffic patterns",
        "How many different types of vehicles?"
    ] : [
        "What do you see in this image?",
        "How many people are visible?",
        "What's the weather like?",
        "Describe the traffic conditions",
        "Are there any vehicles present?",
        "What time of day does it appear to be?"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || searching) return;

        setSearching(true);
        setError(null);
        setResult(null);

        try {
            const response = await onQuery(query.trim());
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process query');
        } finally {
            setSearching(false);
        }
    };

    const handleSuggestedQuery = (suggested: string) => {
        setQuery(suggested);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={sessionData ? "Ask about detected objects..." : "Ask anything about the camera feed..."}
                        className="w-full px-6 py-4 pr-14 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={searching}
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() || searching}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                        aria-label="Search"
                    >
                        {searching ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                            <Search className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>

                {!result && !searching && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-sm text-gray-400">
                            {sessionData ? '📊 Session queries:' : 'Try asking:'}
                        </span>
                        {suggestedQueries.slice(0, 3).map((suggested, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSuggestedQuery(suggested)}
                                className="text-sm px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
                            >
                                {suggested}
                            </button>
                        ))}
                    </div>
                )}
            </form>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3"
                    >
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-200 font-medium">Error</p>
                            <p className="text-red-300 text-sm mt-1">{error}</p>
                        </div>
                    </motion.div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/50 rounded-xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-white font-medium">AI Answer</span>
                            {sessionData && (
                                <span className="ml-auto text-xs bg-purple-600 px-2 py-1 rounded">
                                    Session Analytics
                                </span>
                            )}
                            <span className="text-xs text-gray-400">
                                {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                        </div>

                        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {result.answer}
                        </p>

                        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-sm">
                            <span className="text-gray-400">
                                Confidence: <span className="text-green-400">{result.confidence}</span>
                            </span>
                            <button
                                onClick={() => setResult(null)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Ask another question
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {searching && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl"
                >
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        <span className="text-gray-300">
                            {sessionData ? 'Analyzing session data...' : 'Analyzing camera feed...'}
                        </span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
