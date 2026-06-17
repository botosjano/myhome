@echo off
REM ─── My Home Budapest — dev server launcher ────────────────────────────────
REM Uses the portable Node 20 (in %USERPROFILE%\node20) so it works even though
REM the system Node is too old for Next.js 14. Just double-click this file or
REM run it from a terminal. To use your own Node, install Node 20 LTS and run
REM `npm run dev` instead.
set "PATH=%USERPROFILE%\node20\node-v20.20.2-win-x64;%PATH%"
cd /d "%~dp0"
node node_modules\next\dist\bin\next dev
