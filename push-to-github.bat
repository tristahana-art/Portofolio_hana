@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo   Git Commit ^& Push - Portofolio Trista Hana
echo   Repository: https://github.com/tristahana-art/PORTOFOLIO
echo ==========================================================
echo.

cd /d "%~dp0"

:: Cek apakah git terpasang (cek juga default install path)
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "PATH=%PATH%;C:\Program Files\Git\cmd"
    ) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
        set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Git\cmd"
    )
)

where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git tidak ditemukan di komputer kamu!
    echo Silakan install Git terlebih dahulu dari: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo [1/4] Memeriksa perubahan berkas...
git status -s
echo.

set "commit_msg="
set /p "commit_msg=Masukkan pesan commit (tekan Enter untuk default): "

if "%commit_msg%"=="" (
    for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%b-%%a)
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)
    set "commit_msg=Update portfolio and configuration"
)

echo.
echo [2/4] Menambahkan semua perubahan ke staging (git add -A)...
git add -A

echo.
echo [3/4] Melakukan commit dengan pesan: "%commit_msg%"...
git commit -m "%commit_msg%"

echo.
echo [4/4] Mendorong ke GitHub (git push origin main)...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ==========================================================
    echo   [SUKSES] Perubahan berhasil di-push ke GitHub!
    echo   Lihat di: https://github.com/tristahana-art/PORTOFOLIO
    echo ==========================================================
) else (
    echo.
    echo [PERINGATAN] Push gagal atau membutuhkan login GitHub.
    echo Jika diminta login, masukkan username/Personal Access Token kamu.
)

echo.
pause

