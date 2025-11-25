# Code Review 


This project is an application designed to perform rigorous code reviews using the Google Gemini API. The frontend is built with React/Vite and Tailwind CSS, and the backend uses Flask (Python).
Technologies used:
* Python + Flask
* React Js



##  1.Architecture Summary

The project follows a hexagonal (Ports & Adapters) architecture:

```
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
```



---

## 2. Google Gemini API Key Setup

To enable backend analysis, you must configure your Google Gemini API key.

### Step 1: Get Your API Key
- Visit **Google AI Studio** and generate a new Gemini API key.

### Step 2: Create `.env` File
- Inside your `/backend` directory, create a file named `.env`  
  (make sure the filename starts with a dot).

### Step 3: Add Your API Key
Paste your Gemini API key inside the `.env` file exactly in this format:

API_KEY="AIzaSy...YOUR_GEMINI_KEY_HERE"


## 3. Backend Setup (Python)

The backend handles all API routing and communication with the Gemini model.


### Step 1: Navigate to backend:
cd backend

### Step 2: Create Virtual Environment (Recommended):
This isolates dependencies from your system Python.

# For Windows
*python -m venv venv
*.\venv\Scripts\activate

# For macOS/Linux
*python3 -m venv venv
*source venv/bin/activate

### Step 3: Install Dependencies:

pip install -r requirements.txt

### Step 4: Run the Backend Server:

python app.py


## 3. Frontend Setup 


### Step 1: Navigate to frontend:
cd frontend

### Step 2: Install Node Dependencies:
npm install


### Step 3: Run the Frontend Development Server:

npm run dev












