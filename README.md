# Construction Labor Intelligence App

A specialized dashboard for construction labor intelligence, featuring productivity analysis, union benefit mapping, and financial forecasting.

## Prerequisites

- [Python 3.11+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or via Docker)

---

## Backend Setup (FastAPI)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - **Windows:**
     ```bash
     .\venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   python -m pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   - Check `.env` for database connection strings.

6. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

---

## Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## Features

- **Labor Intelligence**: Productivity Analysis (Billable vs Overhead).
- **Automation**: Anomaly detection for expense spikes.
- **Reporting**: AR Heat Maps for payment trends.
- **Finance Analytics**: Real-time variance and benchmarking.
- **Root Cause Agent**: AI-driven insights footer.
