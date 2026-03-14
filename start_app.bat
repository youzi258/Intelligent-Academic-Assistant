@echo off

REM 学术助手启动脚本（版本2）
REM 一键启动前端和后端服务

setlocal enabledelayedexpansion

echo 正在启动学术助手...
echo ===============================


REM 检查项目目录
echo 检查项目目录...
if not exist "%~dp0app" (
    echo 错误：未找到app目录，请确保脚本在正确的项目目录中运行
    pause
    exit /b 1
) else (
    echo app目录存在
)

if not exist "%~dp0frontend" (
    echo 错误：未找到frontend目录，请确保脚本在正确的项目目录中运行
    pause
    exit /b 1
) else (
    echo frontend目录存在
)

REM 启动后端服务
echo 启动后端服务...
start "Backend Server" cmd /k "cd /d "%~dp0" && python -m uvicorn app.main:app --reload"

REM 等待后端服务启动
echo 等待后端服务启动...
timeout /t 5 /nobreak >nul

REM 启动前端服务
echo 启动前端服务...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

REM 等待前端服务启动
echo 等待前端服务启动...
timeout /t 5 /nobreak >nul

echo ===============================
echo 学术助手已启动！
echo 后端服务地址: http://localhost:8000
echo 前端服务地址: http://localhost:3000 (或其他可用端口)
echo ===============================
echo 注意：后端和前端服务已在新窗口中启动

echo 按任意键退出...
pause

endlocal