import React, { useState } from "react";
import {
  Upload,
  Code,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
  Sparkles,
  Zap,
  Terminal,
  ChevronDown,
  Copy,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api/review";

export default function App() {
  const [activeTab, setActiveTab] = useState("paste");
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // reviewData: { has_error, issues, suggestions, review_markdown, corrected_code }
  const [reviewData, setReviewData] = useState(null);
  const [error, setError] = useState(null);
  const [showFullCode, setShowFullCode] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (activeTab === "paste" && !code.trim()) {
      setError("Please paste some code first.");
      return;
    }
    if (activeTab === "upload" && !file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setReviewData(null);
    setShowFullCode(false);
    setError(null);

    try {
      let body;
      let headers = {};

      if (activeTab === "paste") {
        body = JSON.stringify({ code: code });
        headers = { "Content-Type": "application/json" };
      } else {
        const formData = new FormData();
        formData.append("file", file);
        body = formData;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: headers,
        body: body,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze code");

      setReviewData(data.review);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative text-slate-800 font-sans overflow-x-hidden">
      {/* Backgrounds */}
      <div className="fixed inset-0 bg-[#0f172a] -z-20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/50 via-slate-900/50 to-slate-900 -z-10"></div>
      <div className="fixed inset-0 bg-[url('[https://grainy-gradients.vercel.app/noise.svg](https://grainy-gradients.vercel.app/noise.svg)')] opacity-20 -z-10"></div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Code<span className="text-indigo-400">Review</span>.ai
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Zap className="w-3 h-3" />
            <span>Gemini 2.0 Flash</span>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* LEFT COLUMN: Input */}
        <motion.section
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 overflow-hidden shadow-2xl flex flex-col h-[700px]">
             {/* Tabs */}
            <div className="flex bg-black/20 rounded-xl p-1 shrink-0">
              {["paste", "upload"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab === "paste" ? <Terminal className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {tab === "paste" ? "Editor" : "Upload File"}
                </button>
              ))}
            </div>

            <div className="p-4 flex-1 flex flex-col min-h-0">
              <AnimatePresence mode="wait">
                {activeTab === "paste" ? (
                  <motion.textarea
                    key="paste"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 w-full bg-slate-950/50 text-indigo-100 font-mono text-sm p-4 rounded-xl border border-white/5 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none resize-none placeholder:text-slate-600 custom-scrollbar"
                    placeholder="// Paste your code here..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck="false"
                  />
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1"
                  >
                    <div className="h-full border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group">
                      <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center text-center w-full h-full justify-center">
                        <FileText className="w-12 h-12 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-slate-200 font-medium">Click to upload</span>
                        {file && <div className="mt-4 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">{file.name}</div>}
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Analyze Button */}
            <div className="p-4 pt-0 shrink-0">
              {error && <div className="mb-4 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {error}</div>}
              
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-2 relative overflow-hidden group ${
                  loading ? "cursor-not-allowed opacity-80" : "hover:scale-[1.01] active:scale-[0.99]"
                } transition-all duration-200`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 ${loading ? '' : 'group-hover:bg-[length:200%_auto] animate-gradient'}`}></div>
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {loading ? "Analyzing..." : "Analyze Code"}
                </span>
              </button>
            </div>
          </div>
        </motion.section>

        {/* RIGHT COLUMN: Output */}
        <motion.section
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-7 h-[700px] bg-white rounded-2xl shadow-2xl border border-indigo-100/50 flex flex-col overflow-hidden relative"
        >
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-6 bg-slate-50">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium">Analyzing syntax and logic...</p>
             </div>
          ) : reviewData ? (
            <div className="flex flex-col h-full">
              
              {/* 1. STATUS HEADER */}
              <div className={`p-4 border-b flex items-center justify-between ${
                reviewData.has_error ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"
              }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${reviewData.has_error ? "bg-red-100" : "bg-green-100"}`}>
                        {reviewData.has_error ? <AlertTriangle className="w-5 h-5 text-red-600"/> : <CheckCircle className="w-5 h-5 text-green-600"/>}
                    </div>
                    <div>
                        <h2 className={`font-bold ${reviewData.has_error ? "text-red-700" : "text-green-700"}`}>
                            {reviewData.title || (reviewData.has_error ? "Fixes Required" : "Optimization Available")}
                        </h2>
                        <p className="text-xs text-slate-500">
                           {reviewData.has_error ? "Breaking changes detected" : "Code is valid but can be improved"}
                        </p>
                    </div>
                </div>
                <span className="text-2xl">{reviewData.status_emoji}</span>
              </div>

              {/* 2. CONTENT AREA (Scrollable) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* A. CRITICAL ERRORS (Red Box - Only if has_error is True) */}
                {reviewData.has_error && reviewData.issues && reviewData.issues.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-100 rounded-xl shadow-sm overflow-hidden"
                    >
                        <div className="bg-red-100/50 px-4 py-2 border-b border-red-200 font-semibold text-red-800 text-sm flex items-center gap-2">
                             <AlertCircle className="w-4 h-4"/> 
                             Critical Fixes
                        </div>
                        <ul className="divide-y divide-red-100">
                            {reviewData.issues.map((err, idx) => (
                                <li key={idx} className="px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                    {err}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* B. SUGGESTIONS (Blue/Green Box - Always shown if populated) */}
                {reviewData.suggestions && reviewData.suggestions.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-indigo-100 rounded-xl shadow-sm overflow-hidden"
                    >
                        <div className="bg-indigo-50/80 px-4 py-2 border-b border-indigo-100 font-semibold text-indigo-700 text-sm flex items-center gap-2">
                             <Lightbulb className="w-4 h-4"/> 
                             Recommended Improvements
                        </div>
                        <ul className="divide-y divide-indigo-50">
                            {reviewData.suggestions.map((sug, idx) => (
                                <li key={idx} className="px-4 py-3 text-sm text-slate-600 flex items-start gap-2 hover:bg-slate-50">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                                    {sug}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* C. EXPLANATION (Markdown) */}
                <div className="prose prose-slate prose-sm max-w-none">
                    <h3 className="text-slate-800 font-bold text-md border-b pb-2 mb-3">
                        {reviewData.has_error ? "Detailed Fixes" : "Why these changes help"}
                    </h3>
                    <ReactMarkdown
                         components={{
                             code: ({node, inline, className, children, ...props}) => (
                                <code className="bg-slate-100 text-pink-600 px-1 py-0.5 rounded text-xs font-mono font-bold border border-slate-200" {...props}>
                                  {children}
                                </code>
                              )
                         }}
                    >
                        {reviewData.review_markdown}
                    </ReactMarkdown>
                </div>
              
              </div>

              {/* 3. FOOTER: DYNAMIC BUTTON */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
                  <button 
                    onClick={() => setShowFullCode(!showFullCode)}
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl shadow-sm hover:shadow-md transition-all font-medium ${
                        reviewData.has_error 
                        ? "bg-red-600 text-white border-red-700 hover:bg-red-700" // Error Style
                        : "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700" // Success/Optimized Style
                    }`}
                  >
                     <span className="flex items-center gap-2">
                        {showFullCode ? <ChevronDown className="w-5 h-5"/> : <Terminal className="w-5 h-5"/>}
                        {/* Dynamic Text Logic */}
                        {showFullCode 
                            ? "Hide Code" 
                            : (reviewData.has_error ? "View Fixed Code" : "View Optimized Code")
                        }
                     </span>
                     {!showFullCode && (
                        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                            reviewData.has_error ? "bg-red-700 text-white" : "bg-indigo-500 text-white"
                        }`}>
                            Click to view <ArrowRight className="w-3 h-3"/>
                        </span>
                     )}
                  </button>

                  <AnimatePresence>
                    {showFullCode && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-3"
                        >
                            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800 relative group">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(reviewData.corrected_code)}
                                      className="p-1.5 bg-white/10 text-white rounded hover:bg-white/20"
                                      title="Copy Code"
                                    >
                                        <Copy className="w-4 h-4"/>
                                    </button>
                                </div>
                                <pre className="p-4 text-xs font-mono text-blue-100 overflow-x-auto max-h-[300px] custom-scrollbar">
                                    {reviewData.corrected_code}
                                </pre>
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-6">
                <Code className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Ready to Review</p>
                <p className="text-sm mt-1 max-w-xs mx-auto text-slate-400">
                    Paste your code to see strict error checking vs style suggestions.
                </p>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
