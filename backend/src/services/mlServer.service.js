import axios from 'axios';

// 🌍 Use deployed ML server instead of localhost
const ML_SERVER_URL = process.env.ML_SERVER_URL || "https://krushi-ml-service.onrender.com";

// Port & directory still defined (for compatibility, not used on Render)
const ML_SERVER_PORT = 8000;
const ML_SERVER_DIR = "";
let mlServerProcess = null;

// ----------------------------------------------------------------------
// 1️⃣ Check ML Server status (works for both local & deployed ML)
// ----------------------------------------------------------------------
export const checkMLServerStatus = async () => {
  try {
    const response = await axios.get(`${ML_SERVER_URL}/`, {
      timeout: 2000,
    });

    return response.status === 200 && response.data?.status?.includes("Running");
  } catch (err) {
    return false;
  }
};

// ----------------------------------------------------------------------
// 2️⃣ Dummy port check (always true)
// Render does NOT allow port checks; this keeps your code compatible
// ----------------------------------------------------------------------
const checkPortAvailability = () => {
  return Promise.resolve(true);
};

// ----------------------------------------------------------------------
// 3️⃣ Dummy log filter (unchanged)
// ----------------------------------------------------------------------
const isRealError = (output) => {
  const outputLower = output.toLowerCase();
  const ignoredPatterns = [
    'onednn custom operations',
    'this tensorflow binary is optimized',
    'instructions: avx',
    'model loaded successfully',
    'uvicorn running on',
    'started server process'
  ];

  for (const pattern of ignoredPatterns) {
    if (outputLower.includes(pattern)) return false;
  }

  return (
    outputLower.includes("error") ||
    outputLower.includes("exception") ||
    outputLower.includes("failed") ||
    outputLower.includes("fatal")
  );
};

// ----------------------------------------------------------------------
// 4️⃣ Wait until ML server is ready
// Works both for Render & local
// ----------------------------------------------------------------------
const waitForServerReady = async (maxWaitTime = 60000) => {
  const start = Date.now();

  while (Date.now() - start < maxWaitTime) {
    const ok = await checkMLServerStatus();
    if (ok) return true;

    await new Promise((r) => setTimeout(r, 1000));
  }

  return false;
};

// ----------------------------------------------------------------------
// 5️⃣ startMLServer()
// ✔ On Render → NO ⛔ spawn Python
// ✔ On Local → You can still spawn if needed
// ----------------------------------------------------------------------
export const startMLServer = async () => {
  // If deployed ML server is reachable → done
  const alreadyRunning = await checkMLServerStatus();
  if (alreadyRunning) {
    console.log("ML server already running (external).");
    return;
  }

  // 🔥 On Render: skip spawn logic completely
  if (process.env.RENDER === "true") {
    console.log("Render environment detected → Skipping spawn()");
    return;
  }

  // BELOW CODE ONLY EXECUTES LOCALLY
  console.log("Starting ML server locally...");

  const portAvailable = await checkPortAvailability();
  if (!portAvailable) throw new Error("Port 8000 in use.");

  // Lazy import for spawn so it works in local mode only
  const { spawn } = await import('child_process');

  mlServerProcess = spawn('uvicorn', ['main:app', '--host', '0.0.0.0', '--port', '8000'], {
    cwd: ML_SERVER_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    env: { ...process.env, TF_CPP_MIN_LOG_LEVEL: '2' },
  });

  mlServerProcess.stdout.on("data", (d) => {
    const msg = d.toString();
    if (isRealError(msg)) console.error("[ML Server]", msg.trim());
  });

  mlServerProcess.stderr.on("data", (d) => {
    const msg = d.toString();
    if (isRealError(msg)) console.error("[ML Server Error]", msg.trim());
  });

  await waitForServerReady();
};

// ----------------------------------------------------------------------
// 6️⃣ Return process reference (unchanged)
// ----------------------------------------------------------------------
export const getMLServerProcess = () => mlServerProcess;
