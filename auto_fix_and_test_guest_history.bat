@echo off
cd /d %~dp0
rmdir /s /q .venv
python -m venv .venv
call .venv\Scripts\activate
pip install requests
.venv\Scripts\python.exe backend/auto_test_guest_history.py
pause
