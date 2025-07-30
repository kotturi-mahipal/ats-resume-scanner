import React from 'react';
import type { ATSResult } from '../types'; // Import as type

interface ScoreResultProps {
    result: ATSResult;
}

const ScoreResult: React.FC<ScoreResultProps> = ({ result }) => {
    const scoreColor = result.score >= 75 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="w-full max-w-4xl p-8 space-y-8 bg-white rounded-2xl shadow-lg animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-gray-800">Analysis Complete</h2>
            <div className="flex flex-col md:flex-row items-center justify-center md:space-x-12 space-y-8 md:space-y-0">
                <div className="relative flex items-center justify-center w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                            className="text-gray-200"
                            strokeWidth="3.8"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className={scoreColor}
                            strokeWidth="3.8"
                            strokeDasharray={`${result.score}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className={`absolute text-5xl font-bold ${scoreColor}`}>
                        {result.score}<span className="text-3xl">%</span>
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-semibold text-gray-700">Match Score</h3>
                    <p className="text-gray-500">Based on your resume and the job description.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
                {/* Matching Keywords */}
                <div className="p-6 bg-green-50 rounded-lg">
                    <h4 className="text-xl font-semibold text-green-800 mb-4">Matching Keywords</h4>
                    <ul className="space-y-2">
                        {result.matchingKeywords.map((keyword, index) => (
                            <li key={index} className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                {keyword}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Missing Keywords */}
                <div className="p-6 bg-red-50 rounded-lg">
                    <h4 className="text-xl font-semibold text-red-800 mb-4">Important Missing Keywords</h4>
                    <ul className="space-y-2">
                        {result.missingKeywords.map((keyword, index) => (
                            <li key={index} className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                {keyword}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Suggestions */}
            <div className="pt-6 border-t">
                <div className="p-6 bg-blue-50 rounded-lg">
                    <h4 className="text-xl font-semibold text-blue-800 mb-4">Suggestions for Improvement</h4>
                    <p className="text-gray-700 whitespace-pre-line">{result.suggestions}</p>
                </div>
            </div>
        </div>
    );
};

export default ScoreResult;