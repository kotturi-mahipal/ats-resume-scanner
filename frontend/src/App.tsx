import { useState } from 'react';
import type {FC, ChangeEvent, FormEvent} from 'react';
import axios from 'axios';

// --- TYPE DEFINITION ---
interface ATSResult {
    score: number;
    matchingKeywords: string[];
    missingKeywords: string[];
    suggestions: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// --- SVG ICONS ---
const CheckIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
);

const XIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);

const LightbulbIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-11.62A6.01 6.01 0 0012 1.25a6.01 6.01 0 00-1.5 11.62m1.5 5.25a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
);

const Spinner: FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// --- UI COMPONENTS ---

// 1. Resume Upload Form
const ResumeUploadForm: FC<{ onAnalysis: (result: ATSResult) => void; onLoading: (loading: boolean) => void; onError: (message: string) => void; isLoading: boolean; }> =
    ({ onAnalysis, onLoading, onError, isLoading }) => {
        const [resume, setResume] = useState<File | null>(null);
        const [jobDescription, setJobDescription] = useState('');

        const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) setResume(e.target.files[0]);
        };

        const handleSubmit = async (e: FormEvent) => {
            e.preventDefault();
            if (!resume || !jobDescription) {
                onError('Please provide both a resume and a job description.');
                return;
            }

            onLoading(true);
            onError('');

            const formData = new FormData();
            formData.append('resume', resume);
            formData.append('jobDescription', jobDescription);

            try {
                const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                onAnalysis(response.data);
            } catch (err) {
                console.error(err);
                onError('Could not analyze the resume. Please check the server and try again.');
            } finally {
                onLoading(false);
            }
        };

        return (
            <div className="w-full max-w-3xl bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12 animate-fade-in-slow">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Resume Analyzer</h1>
                    <p className="text-gray-600 mt-2">Get an instant analysis of how well your resume matches a job description.</p>
                </header>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="resume-upload" className="block text-sm font-medium text-gray-700 mb-2">Your Resume (PDF only)</label>
                        <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-beige-200 file:text-beige-800 hover:file:bg-beige-300/80 transition-colors duration-200 cursor-pointer"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                        <textarea
                            id="job-description"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="w-full h-56 px-4 py-3 text-gray-800 bg-gray-50/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500 transition-all duration-200"
                            placeholder="Paste the full job description here..."
                            required
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-x-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isLoading ? <Spinner /> : 'Analyze Now'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

// 2. Analysis Results Display
const AnalysisResult: FC<{ result: ATSResult; onReset: () => void }> = ({ result, onReset }) => {
    const scoreColor = result.score >= 75 ? 'text-green-600' : result.score >= 50 ? 'text-amber-600' : 'text-red-600';
    const scoreRingColor = result.score >= 75 ? 'stroke-green-500' : result.score >= 50 ? 'stroke-amber-500' : 'stroke-red-500';

    return (
        <div className="w-full max-w-5xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 animate-fade-in-slow">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800">Analysis Report</h2>
            </header>

            {/* Score Section */}
            <section className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 pb-10 border-b border-gray-200">
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" className="stroke-gray-200" strokeWidth="3" fill="none" />
                        <path
                            className={`${scoreRingColor} transition-all duration-1000 ease-out`}
                            strokeWidth="3"
                            strokeDasharray={`${result.score}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center text-5xl font-bold ${scoreColor}`}>
                        {result.score}<span className="text-3xl">%</span>
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-semibold text-gray-800">Overall Match Score</h3>
                    <p className="text-gray-600 mt-1">A measure of keyword and skill alignment.</p>
                </div>
            </section>

            {/* Keywords Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-b border-gray-200">
                <div className="bg-green-50/70 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-green-800 mb-4">Matching Skills</h4>
                    <ul className="space-y-2.5">
                        {result.matchingKeywords.map((k, i) => <li key={i} className="flex items-start gap-x-3"><CheckIcon className="w-5 h-5 mt-0.5 text-green-600 shrink-0" /> <span className="text-gray-700">{k}</span></li>)}
                    </ul>
                </div>
                <div className="bg-red-50/70 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-red-800 mb-4">Missing Keywords</h4>
                    <ul className="space-y-2.5">
                        {result.missingKeywords.map((k, i) => <li key={i} className="flex items-start gap-x-3"><XIcon className="w-5 h-5 mt-0.5 text-red-600 shrink-0" /> <span className="text-gray-700">{k}</span></li>)}
                    </ul>
                </div>
            </section>

            {/* Suggestions Section */}
            <section className="pt-10">
                <div className="bg-blue-50/70 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-x-2"><LightbulbIcon className="w-6 h-6" /> AI-Powered Suggestions</h4>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{result.suggestions}</p>
                </div>
            </section>

            <footer className="text-center mt-12">
                <button onClick={onReset} className="px-8 py-2.5 font-semibold text-slate-800 bg-transparent border-2 border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-all duration-200">
                    Analyze Another
                </button>
            </footer>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App: FC = () => {
    const [result, setResult] = useState<ATSResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleReset = () => {
        setResult(null);
        setError('');
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8">
            {!result && (
                <ResumeUploadForm
                    onAnalysis={setResult}
                    onLoading={setIsLoading}
                    onError={setError}
                    isLoading={isLoading}
                />
            )}
            {result && <AnalysisResult result={result} onReset={handleReset} />}
            {error && (
                <div className="mt-6 p-4 w-full max-w-2xl text-center text-red-800 bg-red-100 border border-red-300 rounded-lg animate-fade-in-slow">
                    <p>{error}</p>
                </div>
            )}
        </main>
    );
};

export default App;
