@echo off
echo ============================================
echo  RAKSHA — Deploy to Google Infrastructure
echo ============================================
echo.

echo [1/3] Building frontend...
cd frontend
npm run build
cd ..

echo [2/3] Deploying frontend to Firebase Hosting...
firebase login
firebase use raksha-emergency-557c8
firebase deploy --only hosting

echo [3/3] Deployment complete!
echo.
echo  Live URL: https://raksha-emergency-557c8.web.app
echo ============================================
pause
