@echo off
REM Sincroniza e opcionalmente builda o Zenka Launcher na VM Oracle.
REM Uso: build_zenka_vm [--build]
REM   --build : tambem executa prebuild + gradle assembleDebug
REM Variaveis de ambiente (opcionais): VM_USER, VM_HOST, SSH_KEY
setlocal enabledelayedexpansion

set BUILD_FLAG=%~1
set PROJECT_DIR=%~dp0apps\zenka-launcher

if "%VM_USER%"=="" set VM_USER=ubuntu
if "%VM_HOST%"=="" set VM_HOST=163.176.218.128
if "%SSH_KEY%"=="" set SSH_KEY=C:\Users\diego\Desktop\DIEGO\PROGRAMAS E ETC\DIEGO PROJETOS\TRABALHOS COM AUDIO, VIDEO E MIDIAS EM GERAL\ssh-key-2026-07-10.key

if not exist "%SSH_KEY%" (
  echo [build] Chave SSH nao encontrada: %SSH_KEY%
  exit /b 1
)

if not exist "%PROJECT_DIR%" (
  echo [build] Projeto nao encontrado: %PROJECT_DIR%
  exit /b 1
)

echo [build] Sincronizando para %VM_USER%@%VM_HOST%:~/zenka-launcher
pushd "%PROJECT_DIR%"
scp -o StrictHostKeyChecking=no -i "%SSH_KEY%" -r . %VM_USER%@%VM_HOST%:~/zenka-launcher
set SCP_EXIT=!errorlevel!
popd

if not !SCP_EXIT!==0 (
  echo [build] Falha no scp. Abortando.
  exit /b 1
)

echo [build] npm install na VM...
ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %VM_USER%@%VM_HOST% "cd ~/zenka-launcher && npm install"
if errorlevel 1 (
  echo [build] npm install falhou.
  exit /b 1
)

if /I "%BUILD_FLAG%"=="--build" (
  echo [build] Executando prebuild + build Android...
  ssh -o StrictHostKeyChecking=no -i "%SSH_KEY%" %VM_USER%@%VM_HOST% "cd ~/zenka-launcher && export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 && export ANDROID_HOME=~/android-sdk && rm -rf android && npx expo prebuild --platform android && cd android && ./gradlew assembleDebug"
  if errorlevel 1 (
    echo [build] Build falhou na VM.
    exit /b 1
  )
  echo [build] APK: ~/zenka-launcher/android/app/build/outputs/apk/debug/app-debug.apk
)

echo [build] OK.
endlocal
