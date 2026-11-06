@echo off
title Portofolio Trista Hana - Local Backend Server
echo ==========================================================
echo  Memulai Backend Server Portofolio Trista Hana
echo ==========================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
if %errorlevel% neq 0 (
    echo.
    echo Server dihentikan.
    pause
)

