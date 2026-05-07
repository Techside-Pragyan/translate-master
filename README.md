# LingoSync - Language Translator Application

LingoSync is a modern, responsive full-stack web application for real-time language translation. Built with a React frontend and a FastAPI backend, it features a sleek UI with Tailwind CSS and uses advanced translation capabilities powered by `deep-translator`.

![LingoSync](https://via.placeholder.com/1200x600?text=LingoSync+-+Language+Translator)

## Features

- **Real-Time Translation**: Instantly translate text across numerous languages.
- **Auto Language Detection**: Automatically detects the source language as you type.
- **Speech-to-Text**: Use your microphone to input text using voice (requires browser support).
- **Text-to-Speech**: Listen to translations with native browser text-to-speech support.
- **Translation History**: All translations are saved persistently to a database and can be reviewed anytime.
- **Dark Mode Support**: Seamless transition between light and dark themes.
- **Export & Share**: Easily copy, share, or download translated text to your device.
- **Responsive UI**: Fully responsive design for mobile, tablet, and desktop screens.

## Tech Stack

### Frontend
- **React 19**
- **Vite**
- **Tailwind CSS v4**
- **Lucide React** (Icons)
- **Axios** (API requests)
- **React-Speech-Recognition**

### Backend
- **Python 3**
- **FastAPI** (High-performance API framework)
- **Uvicorn** (ASGI server)
- **Deep-Translator** (Translation engine)
- **SQLAlchemy** (ORM for database interactions)
- **SQLite** (Database)

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
```

Create a virtual environment:
```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows**: `.\venv\Scripts\activate`
- **macOS/Linux**: `source venv/bin/activate`

Install the Python dependencies:
```bash
pip install -r requirements.txt
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```
*The backend API will run on http://localhost:8000*

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

Install the Node.js dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The frontend application will be available at http://localhost:5173*

## API Endpoints

- `GET /languages`: Fetches a list of all supported languages and their codes.
- `POST /translate`: Submits text for translation. Accepts JSON payload `{"text": "...", "source_lang": "auto", "target_lang": "en"}`.
- `GET /history`: Retrieves the 50 most recent translations saved in the database.

## License

This project is licensed under the terms of the MIT license.