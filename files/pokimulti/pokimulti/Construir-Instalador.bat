@echo off
setlocal
chcp 65001 >nul
title PokeMulti - gerar instalador
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale a versao LTS em https://nodejs.org e rode este arquivo de novo.
  start https://nodejs.org
  pause
  exit /b 1
)

echo [1/2] Instalando dependencias (so na primeira vez demora)...
call npm ci 2>nul || call npm install
if errorlevel 1 ( echo Falha ao instalar dependencias. & pause & exit /b 1 )

echo [2/2] Gerando o instalador...
call npm run dist
if errorlevel 1 ( echo Falha ao gerar o instalador. & pause & exit /b 1 )

echo.
echo Pronto! O instalador esta na pasta "dist".
start "" "%~dp0dist"
pause
