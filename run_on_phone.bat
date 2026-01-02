@echo off
cls
echo ==============================================================
echo       PRESCRIPTION GENERATOR - MOBILE ACCESS SERVER
echo ==============================================================
echo.
echo [STEP 1] Ensure your Phone and PC are on the SAME WiFi network.
echo.
echo [STEP 2] Look for your 'IPv4 Address' below:
echo ----------------------------------------------------------
ipconfig | findstr "IPv4"
echo ----------------------------------------------------------
echo.
echo [STEP 3] On your phone, open Chrome/Safari and type:
echo.
echo        http://<YOUR-IP-ADDRESS>:8000
echo.
echo        Example: http://192.168.1.10:8000
echo.
echo ==============================================================
echo Starting Server... Close this window to stop the server.
echo.
python -m http.server 8000 --bind 0.0.0.0
pause
