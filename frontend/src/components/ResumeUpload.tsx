import React, { useState } from 'react';
import type {ATSResult} from '../types'; // Import the type

interface ResumeUploadProps {
    onAnalysisComplete: (result: ATSResult) => void;
    onAnalysisStart: () => void;
    onError: (message: string) => void;
    isLoading: boolean;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onAnalysisComplete, onAnalysisStart, onError, isLoading }) => {
    const [resume, setResume] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setResume(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!resume || !jobDescription) {
            onError('Please upload a resume and paste a job description.');
            return;
        }

        onAnalysisStart();
        onError('');

        const formData = new FormData();
        formData.append('resume', resume);
        formData.append('jobDescription', jobDescription);

        try {
            // Note: We move the axios call to the main App component
            // This component will now just trigger the submission process
            const response = await fetch('http://localhost:8080/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            onAnalysisComplete(data);

        } catch (error) {
            console.error('Error uploading file:', error);
            onError('An error occurred during analysis. Please check the backend server.');
        }
    };

    return (
        <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-800">ATS Resume Checker</h2>
            <p className="text-center text-gray-500">
                Upload your resume and paste the job description to see your match score.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="resume-upload" className="block mb-2 text-sm font-medium text-gray-700">
                        Upload Your Resume (PDF)
                    </label>
                    <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 transition-colors duration-200"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="job-description" className="block mb-2 text-sm font-medium text-gray-700">
                        Paste Job Description
                    </label>
                    <textarea
                        id="job-description"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full h-48 px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 transition-colors duration-200"
                        placeholder="Paste the full job description here..."
                        required
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Analyze My Resume'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResumeUpload;