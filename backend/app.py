from flask import Flask, request, jsonify
from flask_cors import CORS
from review_process import perform_review  

app = Flask(__name__)
CORS(app)

ALLOWED_EXTENSIONS = {'py', 'js', 'jsx', 'ts', 'tsx', 'java', 'cpp', 'c', 'html', 'css', 'sql'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "provider": "Gemini 2.0 Flash (Compiler Mode)"}), 200

@app.route('/api/review', methods=['POST'])
def review_code():
    print("\n--- NEW REQUEST ---")
    code_content = ""
    filename = "snippet.txt"
    
    # 1. Parse Input
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = file.filename
            try:
                code_content = file.read().decode('utf-8')
            except Exception as e:
                return jsonify({"error": "Failed to read file: " + str(e)}), 400
    
    # Handle JSON input
    elif request.json:
        code_content = request.json.get('code') or request.json.get('text')
        
    if not code_content:
        return jsonify({"error": "No code provided. Please paste code or upload a valid file."}), 400

    # 2. Call the analysis
    result = perform_review(code_content, filename)

    # 3. Return result
    if result['status'] == 'success':
        return jsonify({"review": result['data']})
    else:
        return jsonify({"error": result['message']}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
