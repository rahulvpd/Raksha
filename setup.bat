@echo off
echo ============================================
echo  RAKSHA — Project Setup Script
echo ============================================
echo.

echo [1/5] Creating project structure...
cd C:\Users\HP\Desktop\raksha

echo [2/5] Setting up Python backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo [3/5] Setting up React frontend...
cd frontend
npm install
cd ..

echo [4/5] Installing Firebase CLI + Google Cloud SDK...
npm install -g firebase-tools

echo [5/5] Done! Next steps:
echo.
echo  1. Fill in backend\.env with your API keys
echo  2. Fill in frontend\.env with your API keys
echo  3. Run backend:  cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo  4. Run frontend: cd frontend ^&^& npm run dev
echo  5. Open: http://localhost:5173
echo.
echo ============================================
echo  RAKSHA is ready to build!
echo ============================================
pause
