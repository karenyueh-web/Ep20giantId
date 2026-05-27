@echo off
echo Step 1: Kill all Chrome...
taskkill /F /IM chrome.exe /T >nul 2>&1
timeout /t 4 /nobreak >nul

echo Step 2: Clean old debug profile...
rmdir /S /Q "C:\chrome-debug-profile" >nul 2>&1

echo Step 3: Start Chrome with remote debug...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug-profile" http://localhost:5173/Ep20giantId/

echo Step 4: Wait for Chrome to start...
timeout /t 5 /nobreak >nul

echo Step 5: Copy DevToolsActivePort to default location...
copy /Y "C:\chrome-debug-profile\DevToolsActivePort" "C:\Users\G00106917\AppData\Local\Google\Chrome\User Data\DevToolsActivePort" >nul 2>&1

echo Step 6: Check result...
if exist "C:\Users\G00106917\AppData\Local\Google\Chrome\User Data\DevToolsActivePort" (
    echo SUCCESS: DevToolsActivePort found!
    type "C:\Users\G00106917\AppData\Local\Google\Chrome\User Data\DevToolsActivePort"
) else (
    echo FAIL: DevToolsActivePort not found
    echo Checking debug profile directory...
    dir "C:\chrome-debug-profile\" 2>&1
)

echo Step 7: Check port 9222...
netstat -an | findstr 9222
echo Done.
