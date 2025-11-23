import React, { useState } from "react";
import {
  Upload,
  Code,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

// NOTE: Ensure your backend is running on this port
const API_URL = "http://localhost:5000/api/review";

export default function App() {
  const [activeTab, setActiveTab] = useState("paste");
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);

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
    setReview(null);
    setError(null);

    try {
      let body;
      let headers = {};

      if (activeTab === "paste") {
        body = JSON.stringify({ text: code }); // ✅ changed from { code }
        headers = { "Content-Type": "application/json" };
      } else {
        const formData = new FormData();
        formData.append("file", file);
        body = formData;
      }

      console.log("starting the fetch process,.,....");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: headers,
        body: body,
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) throw new Error(data.error || "Failed to analyze code");

      setReview(data.review);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 font-sans">
      {/* Header with entrance animation */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-indigo-600 text-white p-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-indigo-500 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Code className="w-8 h-8 text-indigo-100" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight">CodeReview.ai</h1>
          </div>
          <p className="text-indigo-200 text-sm hidden sm:flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI-Powered Analysis
          </p>
        </div>
      </motion.header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Input Section */}
        <motion.section
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[650px]"
        >
          <div className="border-b border-gray-100 bg-gray-50/50 p-1 flex">
            {["paste", "upload"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab === "paste" ? (
                  <Code className="w-4 h-4" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {tab === "paste" ? "Paste Code" : "Upload File"}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 flex flex-col relative">
            <AnimatePresence mode="wait">
              {activeTab === "paste" ? (
                <motion.div
                  key="paste"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col"
                >
                  <textarea
                    className="flex-1 w-full bg-gray-900 text-gray-100 font-mono text-sm p-4 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    placeholder="// Paste your code here for instant review..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1"
                >
                  <div className="h-full border-2 border-dashed border-indigo-100 rounded-xl flex flex-col items-center justify-center bg-indigo-50/30 hover:bg-indigo-50 transition-colors group">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center text-center w-full h-full justify-center"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className="bg-white p-4 rounded-full shadow-sm mb-4"
                      >
                        <FileText className="w-10 h-10 text-indigo-500" />
                      </motion.div>
                      <span className="text-gray-700 font-medium text-lg">
                        Drop your file here
                      </span>
                      <span className="text-gray-400 text-sm mt-1">
                        or click to browse
                      </span>
                      {file && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-6 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-md flex items-center gap-2"
                        >
                          <CheckCircle className="w-3 h-3" /> {file.name}
                        </motion.div>
                      )}
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className={`mt-4 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Analyze Code
                </>
              )}
            </motion.button>
          </div>
        </motion.section>

        {/* Output Section */}
        <motion.section
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 h-[650px] flex flex-col overflow-hidden relative"
        >
          <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" /> Review Report
            </h2>
            {review && (
              <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-1 rounded">
                Analysis Complete
              </span>
            )}
          </div>

          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-10 h-10 text-indigo-500" />
                </motion.div>
                <p className="animate-pulse">Generating insights...</p>
              </div>
            ) : review ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-indigo prose-sm max-w-none"
              >
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-2xl font-bold text-gray-900 border-b pb-2 mb-6"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-lg font-bold text-indigo-700 mt-6 mb-3 flex items-center gap-2"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="space-y-2 mb-4" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="flex items-start gap-2" {...props}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                        <span className="flex-1">{props.children}</span>
                      </li>
                    ),
                    code: ({ node, inline, ...props }) =>
                      inline ? (
                        <code
                          className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-xs font-mono font-bold"
                          {...props}
                        />
                      ) : (
                        <div className="mockup-code bg-gray-900 rounded-lg overflow-hidden my-4 shadow-md">
                          <div className="p-3 overflow-x-auto">
                            <code
                              className="block text-gray-100 text-xs font-mono leading-relaxed"
                              {...props}
                            />
                          </div>
                        </div>
                      ),
                  }}
                >
                  {review}
                </ReactMarkdown>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="bg-gray-50 p-6 rounded-full mb-4"
                >
                  <Code className="w-12 h-12 text-gray-300" />
                </motion.div>
                <p className="text-lg font-medium text-gray-500">
                  Ready to Review
                </p>
                <p className="text-sm mt-1 max-w-xs mx-auto">
                  Submit your code to receive comprehensive AI-powered feedback.
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
