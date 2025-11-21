# backend/app.py

import os
import json
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from review_processor import perform_review_task 


load_dotenv()

# --- Custom JSON Encoder for MongoDB ObjectId ---
# Flask needs to know how to serialize MongoDB's BSON types to JSON
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return str(o)
        return json.JSONEncoder.default(self, o)

# --- Flask App Setup ---
app = Flask(__name__)
# Allow React (e.g., on port 3000) to talk to Flask (e.g., on port 5000)
CORS(app) 
app.json_encoder = JSONEncoder

# --- MongoDB Setup ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/CodeReviewDB")
client = MongoClient(MONGO_URI)
db = client.get_database() # The database name is part of the URI
reviews_collection = db['reviews']

# --- Flask Routes ---

@app.route('/api/review', methods=['POST'])
def submit_review():
    """
    Receives code, saves initial job to DB, and triggers background task.
    """
    try:
        data = request.get_json()
        code_content = data.get('code', '').strip()
        filename = data.get('filename', 'untitled.txt')
        
        if not code_content:
            return jsonify({"error": "No code content provided"}), 400

        # 1. Create Initial Document in MongoDB
        review_doc = {
            "code_content": code_content,
            "filename": filename,
            "status": "PENDING",
            "submitted_at": datetime.utcnow(),
            "review_report": None
        }
        
        result = reviews_collection.insert_one(review_doc)
        job_id_str = str(result.inserted_id)

        # 2. Trigger the asynchronous task
        perform_review_task.delay(job_id_str, code_content)

        # 3. Return Job ID immediately
        return jsonify({
            "job_id": job_id_str,
            "status": "PENDING",
            "message": "Code review started successfully."
        }), 202 # 202 Accepted status

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@app.route('/api/review/<job_id>', methods=['GET'])
def get_review_status(job_id):
    """
    Polls MongoDB for the job status and returns the report if complete.
    """
    try:
        # Use ObjectId to query MongoDB by ID
        review_data = reviews_collection.find_one({"_id": ObjectId(job_id)})
        
        if not review_data:
            return jsonify({"error": "Job not found"}), 404

        # Remove the large code content before sending to frontend
        review_data.pop('code_content', None) 
        
        # Returns the full document, which React will check for 'status'
        return jsonify(review_data), 200

    except Exception:
        return jsonify({"error": "Invalid job ID format"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)