🧑‍💻 Code Review Assistant (Gemini-Powered)

This project is a full-stack application designed to perform rigorous code reviews using the Google Gemini API. The frontend is built with React/Vite and Tailwind CSS, and the backend uses Flask (Python).

🚀 Setup & Installation

Follow these steps to set up the backend and frontend environment and get the application running locally.

1. Project Structure

Ensure your file structure resembles the following:

/code-review-assistant
├── /backend
│     ├── app.py
│     ├── review_process.py
│     ├── requirements.txt
│     └── .env  <-- IMPORTANT: For your API Key
└── /frontend
      ├── src/
      │    └── App.jsx
      └── ... (other Node/Vite files)


2. Google Gemini API Key Setup

You need a Gemini API Key to run the backend analysis.

Get Your Key: Go to Google AI Studio.

Create .env File: In your /backend directory, create a new file named .env (note the preceding dot).

Paste Key: Add your API key to this file exactly as shown below:

API_KEY="AIzaSy...YOUR_GEMINI_KEY_HERE"


3. Backend Setup (Python)

The backend handles the API routing and the communication with the Gemini model.

Navigate to Backend:

cd backend


Create Virtual Environment (Recommended):
This isolates dependencies from your system Python.

# For Windows
python -m venv venv
.\venv\Scripts\activate

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate


Install Dependencies:
Use the provided requirements.txt file to install all necessary Python packages (Flask, google-generativeai, python-dotenv, etc.).

pip install -r requirements.txt


Run the Backend Server:
The server will run on http://127.0.0.1:5000.

python app.py


Leave this terminal running.

4. Frontend Setup (React/Vite)

The frontend provides the user interface for pasting code and viewing the review report.

Navigate to Frontend:
Open a new terminal window.

cd frontend


Install Node Dependencies:
Assuming you have a package.json file in the /frontend directory:

npm install


Run the Frontend Development Server:
The frontend will typically run on http://localhost:5173.

npm run dev
