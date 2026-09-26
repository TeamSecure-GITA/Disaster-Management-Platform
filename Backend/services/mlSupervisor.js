const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

let mlProcess = null;
let isSupervising = false;

const isMlBackendHealthy = async (url = "http://localhost:8000/health") => {
  try {
    const res = await axios.get(url, { timeout: 1500 });
    return res.status === 200;
  } catch {
    return false;
  }
};

const startMlBackendSupervisor = async () => {
  if (process.env.AUTO_START_ML === "false") {
    console.log("[ML-Supervisor] AUTO_START_ML is disabled by configuration");
    return null;
  }

  const isAlive = await isMlBackendHealthy();
  if (isAlive) {
    console.log("✅ [ML-Supervisor] AI/ML Backend is already running on port 8000");
    return null;
  }

  const possiblePaths = [
    path.resolve(__dirname, "../../ml_backend"),
    path.resolve(__dirname, "../ml_backend"),
    path.resolve(process.cwd(), "ml_backend"),
    path.resolve(process.cwd(), "../ml_backend"),
  ];
  const mlDir = possiblePaths.find((p) => fs.existsSync(p));
  if (!mlDir) {
    console.warn("[ML-Supervisor] ML directory not found in candidate paths, skipping auto-start");
    return null;
  }

  const venvUvicorn = path.join(mlDir, ".venv/bin/uvicorn");
  const venvPython = path.join(mlDir, ".venv/bin/python");

  let executable = "python3";
  let args = ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"];

  if (fs.existsSync(venvUvicorn)) {
    executable = venvUvicorn;
    args = ["app.main:app", "--host", "0.0.0.0", "--port", "8000"];
  } else if (fs.existsSync(venvPython)) {
    executable = venvPython;
    args = ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"];
  }

  console.log(`🚀 [ML-Supervisor] Spawning AI/ML FastAPI service: ${executable} ${args.join(" ")}`);

  try {
    mlProcess = spawn(executable, args, {
      cwd: mlDir,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    isSupervising = true;

    mlProcess.stdout.on("data", (data) => {
      const line = data.toString().trim();
      if (line && process.env.LOG_LEVEL === "debug") {
        console.log(`[ML-Backend] ${line}`);
      }
    });

    mlProcess.stderr.on("data", (data) => {
      const line = data.toString().trim();
      if (line.includes("Application startup completed") || line.includes("Uvicorn running")) {
        console.log(`✅ [ML-Backend] ${line}`);
      } else if (process.env.LOG_LEVEL === "debug") {
        console.warn(`[ML-Backend] ${line}`);
      }
    });

    mlProcess.on("exit", (code, signal) => {
      if (isSupervising) {
        console.warn(`[ML-Supervisor] ML backend exited with code ${code} (${signal})`);
      }
      mlProcess = null;
    });

    // Wait up to 8 seconds for health check
    for (let i = 0; i < 16; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (await isMlBackendHealthy()) {
        console.log("✅ [ML-Supervisor] AI/ML Backend verified healthy on http://localhost:8000");
        break;
      }
    }

    return mlProcess;
  } catch (err) {
    console.error("[ML-Supervisor] Failed to spawn ML Backend child process:", err.message);
    return null;
  }
};

const stopMlBackendSupervisor = async () => {
  if (!mlProcess) return;

  isSupervising = false;
  console.log("[ML-Supervisor] Stopping supervised AI/ML Backend process...");

  try {
    mlProcess.kill("SIGTERM");
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (mlProcess) {
          try {
            mlProcess.kill("SIGKILL");
          } catch {}
        }
        resolve();
      }, 3000);

      mlProcess.once("exit", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  } catch (err) {
    console.warn("[ML-Supervisor] Error stopping ML process:", err.message);
  } finally {
    mlProcess = null;
  }
};

module.exports = {
  startMlBackendSupervisor,
  stopMlBackendSupervisor,
  isMlBackendHealthy,
};
