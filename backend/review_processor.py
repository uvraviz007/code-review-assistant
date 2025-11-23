from openai import OpenAI

# --- CONFIGURATION ---
# TODO: PASTE YOUR OPENAI KEY HERE
OPENAI_API_KEY = "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"

client = OpenAI(api_key=OPENAI_API_KEY)

def perform_review(code_content, filename):
    """
    Analyzes code using OpenAI GPT-4o.
    Returns a dictionary with status and review content.
    """
    if not client:
        return {"status": "error", "message": "OpenAI API Key is missing in review_process.py"}

    try:
        print(f"   [Process] Starting OpenAI analysis for {filename}...")
        
        system_prompt = (
            "You are a strict Code Compiler and Reviewer. "
            "Analyze the provided code for:\n"
            "1. *Syntax Errors:* Mistakes preventing parsing.\n"
            "2. *Compile-time Errors:* Type mismatches, missing imports, etc.\n"
            "3. *Fixes:* Provide the corrected version.\n"
            "Output your response in clear Markdown."
        )

        user_message = f"Filename: {filename}\nCode:\n\n{code_content}\n"

        response = client.chat.completions.create(
            model="gpt-4o", # You can switch to "gpt-3.5-turbo" if needed
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
        )

        # Extract the content from the response
        review_text = response.choices[0].message.content
        
        print("   [Process] Analysis complete.")
        
        return {"status": "success", "review": review_text}

    except Exception as e:
        print(f"   [Process] Error: {e}")
        return {"status": "error", "message": str(e)}