import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()
# --- CONFIGURATION ---
# The API key is correctly loaded from the environment
GEMINI_API_KEY = os.environ.get("API_KEY") 


def clean_json_string(json_string):
    """
    Cleans the string to ensure it's valid JSON by aggressively extracting 
    only the content between the first { and the last } in the string.
    
    Uses a highly robust regex to find the complete JSON object, ignoring 
    any surrounding text (markdown, comments, intros/outros).
    """
    # Pattern 1: Find the JSON block, even if wrapped in markdown or other text
    match = re.search(r"\{[\s\S]*\}", json_string.strip(), re.DOTALL)
    
    if match:
        extracted_json = match.group(0).strip()
        
        if extracted_json.startswith(''):
             extracted_json = re.sub(r"json\s*|\s*", "", extracted_json, flags=re.DOTALL | re.IGNORECASE)
        
        if extracted_json.startswith('{') and extracted_json.endswith('}'):
             return extracted_json
    
    return json_string.strip()


def perform_review(code_content, filename):
    """
    Analyzes code using Google Gemini 2.0 Flash.
    Strictly enforces compilation rules and human-like commenting.
    """
    if not GEMINI_API_KEY or "AIza" not in GEMINI_API_KEY:
        return {"status": "error", "message": "API Key not found or is invalid. Check your .env file and environment setup."}

    try:
        print(f"  [Process] Starting Strict Compiler Analysis for {filename}...")
        
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = (
            f"You are a highly demanding and extremely strict Code Compiler and Senior Software Engineer. Review the file: {filename}\n"
            f"Code Content:\n\n{code_content}\n```\n\n"
            "*STRICT ANALYSIS RULES:*\n"
            "1. *CRITICAL ERROR (has_error: true) ONLY IF:* The code fails compilation, would crash at runtime (e.g., divide by zero, infinite loop), or has missing essential components (e.g., missing C++ namespaces or Python imports).\n"
            "2. *VALID CODE (has_error: false) IF:* The code runs and executes successfully, even if it has poor style, is inefficient, or could be refactored.\n"
            "3. *Optimization:* List all style and efficiency issues under 'suggestions'.\n"
            "4. *Corrected Code:* Provide the final, clean, optimized, and strictly correct version.\n\n"
            "*COMMENTING RULE (MANDATORY):* In the 'corrected_code' output, *STRICTLY PROHIBIT* all obvious, verbose, or boilerplate comments (e.g., // Initialize loop). Only include comments when explaining complex, non-obvious logic, exactly how a professional human developer would comment for clarity.\n\n"
            "*RESPONSE INSTRUCTIONS:* Generate the output as a single, valid JSON object following the schema defined below. Do not include any text, headers, or markdown outside of the JSON block.\n\n"
            "*SUCCESS EXAMPLE (NO ERROR):* If the code runs, set \"has_error\": false, \"issues\": [], and \"status_emoji\": \"⚡\"."
        )
        
        # Define the expected JSON Schema for structured output
        json_schema = {
            "type": "OBJECT",
            "properties": {
                "has_error": {"type": "BOOLEAN", "description": "True if code fails to run (syntax/runtime/missing imports). False if it runs but has style/optimization issues."},
                "status_emoji": {"type": "STRING", "description": "Emoji: 🚨 for error, ⚡ for optimized/valid."},
                "title": {"type": "STRING", "description": "Short status title (e.g., Compilation Error / Optimized Code Available)."},
                "issues": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "List of BREAKING ERRORS only. Empty if has_error is false."},
                "suggestions": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "List of specific logic fixes, improvements, or optimization suggestions."},
                "review_markdown": {"type": "STRING", "description": "Brief markdown explanation of the review."},
                "corrected_code": {"type": "STRING", "description": "The Final Fixed/Optimized Code. Must follow the strict COMMENTING RULE."}
            },
            "required": ["has_error", "status_emoji", "title", "issues", "suggestions", "review_markdown", "corrected_code"]
        }

        generation_config = {
            "response_mime_type": "application/json",
            "response_schema": json_schema
        }

        response = model.generate_content(
            prompt,
            generation_config=generation_config # Corrected keyword argument
        )
        
        # Clean and attempt to parse the JSON
        raw_text = response.text
        cleaned_json = clean_json_string(raw_text)
        
        try:
            review_data = json.loads(cleaned_json)
        except json.JSONDecodeError as e:
            print(f"  [Process] JSON Parse failed: {e}")
            review_data = {
                "has_error": True,
                "status_emoji": "⚠️",
                "title": "Analysis Format Error (Intermittent)",
                "issues": [f"Could not parse AI response structure. JSONDecodeError: {str(e)}."],
                "suggestions": [f"Raw JSON output received was: {cleaned_json[:200]}..."],
                "review_markdown": f"The AI response structure was intermittently corrupted. Please try again. Raw output details are available in the Critical Fixes section.",
                "corrected_code": "// Review failed due to structural error. Check backend logs."
            }
        
        print("  [Process] Analysis complete.")
        return {"status": "success", "data": review_data}

    except Exception as e:
        print(f"  [Process] Error: {e}")
        return {"status": "error", "message": str(e)}
