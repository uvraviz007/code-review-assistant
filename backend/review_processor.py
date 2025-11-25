import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()
# --- CONFIGURATION ---
# TODO: PASTE YOUR GOOGLE GEMINI KEY HERE
GEMINI_API_KEY = os.environ.get("API_KEY") 


def clean_json_string(json_string):
    """
    Cleans the string to ensure it's valid JSON.
    Removes markdown code blocks if present.
    """
    if "" in json_string:
        json_string = re.sub(r"json\n?", "", json_string)
        json_string = re.sub(r"\n?", "", json_string)
    return json_string.strip()

def perform_review(code_content, filename):
    """
    Analyzes code using Google Gemini 2.0 Flash.
    Strictly enforces compilation rules and human-like commenting.
    """
    if not GEMINI_API_KEY or "AIza" not in GEMINI_API_KEY:
        return {"status": "error", "message": "Invalid or missing Google Gemini API Key in review_process.py"}

    try:
        print(f"   [Process] Starting Strict Compiler Analysis for {filename}...")
        
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')

        # --- UPDATED PROMPT ---
        prompt = (
            f"You are a strict Code Compiler and Senior Software Engineer. Review the file: {filename}\n"
            f"Code Content:\n\n{code_content}\n```\n\n"
            "*ANALYSIS RULES:*\n"
            "1. *Strict Syntax Check:* Treat missing namespaces (e.g., cout without using namespace std; or std::), missing semicolons, or undefined variables as *CRITICAL ERRORS*.\n"
            "2. *Runtime/Logic Check:* Look for infinite loops, off-by-one errors, or security risks.\n"
            "3. *Optimization:* If code is valid, look for performance or readability improvements.\n\n"
            "*OUTPUT FORMAT (JSON ONLY):*\n"
            "{\n"
            '  "has_error": true/false, (True if syntax error, missing import/namespace, or runtime crash. False if code runs but is just ugly/slow)\n'
            '  "status_emoji": "🚨" (Error) or "⚡" (Optimized),\n'
            '  "title": "Short status title (e.g., Compilation Error / Optimized Code Available)",\n'
            '  "issues": ["List of syntax/runtime errors. Empty if code is valid."],\n'
            '  "suggestions": ["List of specific improvements."],\n'
            '  "review_markdown": "Brief markdown explanation.",\n'
            '  "corrected_code": "The Final Code. RULES: 1. Fix all errors. 2. Optimize logic. 3. COMMENTS: Remove obvious comments (e.g., \'include library\'). Only add short, necessary comments where logic is complex, exactly how a human would write them."\n'
            "}\n"
        )

        response = model.generate_content(prompt)
        
        # Clean and Parse JSON
        raw_text = response.text
        cleaned_json = clean_json_string(raw_text)
        
        try:
            review_data = json.loads(cleaned_json)
        except json.JSONDecodeError:
            print("   [Process] JSON Parse failed, falling back to text.")
            review_data = {
                "has_error": True,
                "status_emoji": "⚠️",
                "title": "Analysis Format Error",
                "issues": ["Could not parse AI response structure."],
                "suggestions": [],
                "review_markdown": raw_text,
                "corrected_code": "// Could not extract code separately."
            }
        
        print("   [Process] Analysis complete.")
        return {"status": "success", "data": review_data}

    except Exception as e:
        print(f"   [Process] Error: {e}")
        return {"status": "error", "message": str(e)}
