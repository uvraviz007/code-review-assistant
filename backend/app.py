
from flask import Flask, request, jsonify
from flask_cors import CORS
# Import the function from the file above
from review_process import perform_review  

app = Flask(_name_)
CORS(app)

ALLOWED_EXTENSIONS = {'py', 'js', 'jsx', 'ts', 'tsx', 'java', 'cpp', 'c', 'html', 'css'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    # Updated provider name to reflect the change
    return jsonify({"status": "healthy", "provider": "OpenAI GPT-4o Modular"}), 200

@app.route('/api/review', methods=['POST'])
def review_code():
    print("\n--- NEW REQUEST ---")
    code_content = ""
    filename = "code_snippet"
    
    # 1. Parse Input
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = file.filename
            try:
                code_content = file.read().decode('utf-8')
            except Exception as e:
                return jsonify({"error": str(e)}), 400
    elif 'code' in request.json:
        code_content = request.json['code']

    if not code_content:
        return jsonify({"error": "No code provided"}), 400

    # 2. Call the separate logic module
    print("1. Calling review process...")
    result = perform_review(code_content, filename)

    # 3. Return result
    if result['status'] == 'success':
        print("2. Sending response to frontend.")
        return jsonify({"review": result['review']})
    else:
        return jsonify({"error": result['message']}), 500

if _name_ == '_main_':
    app.run(debug=True, port=5000)