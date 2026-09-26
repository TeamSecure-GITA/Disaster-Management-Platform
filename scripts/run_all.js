#!/usr/bin/env node

/**
 * Universal Disaster Management Platform Orchestrator
 * Runs Backend (Express:5000), ML Engine (FastAPI:8000), and Frontend (Vite:5500) simultaneously.
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT_DIR = path.resolve(__dirname, "..");
const BACKEND_DIR = path.join(ROOT_DIR, "Backend");
const ML_DIR = path.join(ROOT_DIR, "ml_backend");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  backend: "\x1b[36m",   // Cyan
  ml: "\x1b[35m",        // Magenta
  frontend: "\x1b[32m",  // Green
  system: "\x1b[33m",    // Yellow
  error: "\x1b[31m",     // Red
};

function log(service, color, data) {
  const lines = data.toString().split("\n");
  for (const line of lines) {
    if (line.trim()) {
      console.log(`${color}${colors.bright}[${service}]${colors.reset} ${line}`);
    }
  }
}

const processes = [];
let shuttingDown = false;

function startProcess(name, color, command, args, cwd, env = {}) {
  console.log(`${colors.system}⚡ Starting ${name} in ${cwd}...${colors.reset}`);

  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    shell: true,
  });

  child.stdout.on("data", (d) => log(name, color, d));
  child.stderr.on("data", (d) => log(name, color, d));

  child.on("exit", (code, signal) => {
    if (!shuttingDown) {
      console.log(
        `${colors.system}[${name}] exited with code ${code || signal}${colors.reset}`
      );
    }
  });

  processes.push({ name, child });
  return child;
}

// 1. Resolve ML Backend executable
let mlCmd = "python3";
let mlArgs = ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"];
const venvUvicorn = path.join(ML_DIR, ".venv/bin/uvicorn");
if (fs.existsSync(venvUvicorn)) {
  mlCmd = venvUvicorn;
  mlArgs = ["app.main:app", "--host", "0.0.0.0", "--port", "8000"];
}

console.log(`${colors.system}====================================================${colors.reset}`);
console.log(`${colors.system}   DISASTER MANAGEMENT PLATFORM - UNIFIED RUNTIME   ${colors.reset}`);
console.log(`${colors.system}   Backend: http://localhost:5000                   ${colors.reset}`);
console.log(`${colors.system}   AI / ML: http://localhost:8000                   ${colors.reset}`);
console.log(`${colors.system}   Web App: http://localhost:5500                   ${colors.reset}`);
console.log(`${colors.system}====================================================${colors.reset}\n`);

// Start ML Backend
startProcess("ML-AI", colors.ml, mlCmd, mlArgs, ML_DIR, {
  PYTHONUNBUFFERED: "1",
});

// Start Backend API
startProcess("BACKEND", colors.backend, "node", ["server.js"], BACKEND_DIR, {
  AUTO_START_ML: "false", // Handled directly by orchestrator
});

// Start Frontend
startProcess("FRONTEND", colors.frontend, "npx", ["vite", "--port", "5500"], FRONTEND_DIR);

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n${colors.system}🛑 Shutting down all services gracefully...${colors.reset}`);

  for (const { name, child } of processes) {
    try {
      child.kill("SIGTERM");
    } catch (e) {
      // Ignore
    }
  }

  setTimeout(() => {
    for (const { child } of processes) {
      try {
        child.kill("SIGKILL");
      } catch (e) {
        // Ignore
      }
    }
    process.exit(0);
  }, 2500);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
