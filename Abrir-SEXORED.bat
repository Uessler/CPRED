@echo off
setlocal
set "SEXORED_ROOT=C:\Users\joaog\Documents\sexored"
set "MAPTOOL_ROOT=C:\Users\joaog\Documents\Codex\2026-10-30\https-github-com-rptools-maptool-utm\outputs\MapTool"
set "JAVA_OPTS=-DMAPTOOL_DATADIR=%SEXORED_ROOT%/perfil-maptool"
cd /d "%MAPTOOL_ROOT%"
call "%MAPTOOL_ROOT%\Iniciar-MapTool.bat" -f -F "%SEXORED_ROOT%\dist\SEXORED-0.3.cmpgn"
