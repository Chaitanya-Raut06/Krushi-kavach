import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to ML server directory (relative to backend/src)
const ML_SERVER_DIR = path.resolve(__dirname, '../../..', 'ml_server');
const ML_SERVER_URL = 'http://localhost:8000';
const ML_SERVER_PORT = 8000;
const ML_SERVER_CHECK_TIMEOUT = 2000; // 2 seconds
const ML_SERVER_READY_TIMEOUT = 60000; // 60 seconds max wait for server to be ready

// Store the ML server process reference
let mlServerProcess = null;

/**
 * Check if port 8000 is available (not in use)
 * @returns {Promise<boolean>} True if port is available, false if in use
 */
const checkPortAvailability = () => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(ML_SERVER_PORT, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // Port is in use
    });
  });
};

/**
 * Filter out TensorFlow informational logs
 * @param {string} output - Log output string
 * @returns {boolean} True if should be logged as error, false otherwise
 */
const isRealError = (output) => {
  const outputLower = output.toLowerCase();
  
  // Filter out TensorFlow informational messages
  const ignoredPatterns = [
    'onednn custom operations',
    'this tensorflow binary is optimized',
    'tensorflow binary was not compiled',
    'to enable them in other operations',
    'instructions: avx avx2',
    'your cpu supports instructions',
    'loaded the model',
    'model loaded successfully',
    'uvicorn running on',
    'application startup complete',
    'started server process',
    'waiting for application startup',
  ];
  
  // Check if output contains any ignored pattern
  for (const pattern of ignoredPatterns) {
    if (outputLower.includes(pattern)) {
      return false; // Not a real error
    }
  }
  
  // Only log actual errors or exceptions
  return outputLower.includes('error') || 
         outputLower.includes('exception') || 
         outputLower.includes('failed') ||
         outputLower.includes('fatal');
};

/**
 * Check if ML server is running by making an HTTP request to the health check endpoint
 * @returns {Promise<boolean>} True if server is running and ready, false otherwise
 */
export const checkMLServerStatus = async () => {
  try {
    const response = await axios.get(`${ML_SERVER_URL}/`, {
      timeout: ML_SERVER_CHECK_TIMEOUT,
    });
    return response.status === 200 && response.data?.status === 'ML Server Running';
  } catch (error) {
    // Server is not running or not accessible
    return false;
  }
};

/**
 * Wait for ML server to be fully ready (model loaded and accepting requests)
 * @param {number} maxWaitTime - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} True if server is ready, false if timeout
 */
const waitForServerReady = async (maxWaitTime = ML_SERVER_READY_TIMEOUT) => {
  const startTime = Date.now();
  const pollInterval = 1000; // Check every second
  
  while (Date.now() - startTime < maxWaitTime) {
    const isReady = await checkMLServerStatus();
    if (isReady) {
      // Additional check: try to access /predict endpoint to ensure model is loaded
      try {
        // Just check if endpoint exists, don't send actual data
        await axios.get(`${ML_SERVER_URL}/docs`, { timeout: 2000 });
        return true;
      } catch (err) {
        // If docs endpoint fails, server might still be loading
        // Continue polling
      }
    }
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  return false; // Timeout
};

/**
 * Start the ML FastAPI server using uvicorn
 * @returns {Promise<void>}
 */
export const startMLServer = async () => {
  // First check if server is already running via HTTP
  const isRunning = await checkMLServerStatus();
  if (isRunning) {
    return;
  }

  // Check if port is already in use (prevent duplicate starts)
  const portAvailable = await checkPortAvailability();
  if (!portAvailable) {
    // Port is in use, wait a bit and check again via HTTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isRunningNow = await checkMLServerStatus();
    if (isRunningNow) {
      return; // Server is running
    }
    // Port is in use but server not responding - might be another process
    throw new Error('Port 8000 is already in use by another process');
  }

  // If process already exists, don't start again
  if (mlServerProcess && !mlServerProcess.killed) {
    return;
  }

  try {
    // Suppress TensorFlow informational logs by setting environment variable
    const env = {
      ...process.env,
      TF_CPP_MIN_LOG_LEVEL: '2', // Suppress INFO and WARNING, only show ERROR
    };

    // Start uvicorn server
    mlServerProcess = spawn('uvicorn', ['main:app', '--host', '0.0.0.0', '--port', '8000'], {
      cwd: ML_SERVER_DIR,
      stdio: ['ignore', 'pipe', 'pipe'], // Ignore stdin, pipe stdout and stderr
      shell: process.platform === 'win32', // Use shell on Windows
      env: env,
    });

    // Handle stdout - filter out TensorFlow informational logs
    mlServerProcess.stdout.on('data', (data) => {
      const output = data.toString();
      // Only log real errors, ignore TensorFlow informational messages
      if (isRealError(output)) {
        console.error('[ML Server]', output.trim());
      }
    });

    // Handle stderr - filter out TensorFlow informational logs
    mlServerProcess.stderr.on('data', (data) => {
      const output = data.toString();
      // Only log real errors, ignore TensorFlow informational messages and warnings
      if (isRealError(output) && !output.toLowerCase().includes('warning')) {
        console.error('[ML Server Error]', output.trim());
      }
    });

    // Handle process exit
    mlServerProcess.on('exit', (code) => {
      if (code !== null && code !== 0) {
        console.error(`[ML Server] Process exited with code ${code}`);
      }
      mlServerProcess = null;
    });

    // Handle process errors
    mlServerProcess.on('error', (error) => {
      console.error('[ML Server] Failed to start:', error.message);
      mlServerProcess = null;
      throw error;
    });

    // Wait for server to be fully ready (model loaded)
    const isReady = await waitForServerReady();
    if (!isReady) {
      throw new Error('ML server failed to start within timeout period');
    }
  } catch (error) {
    console.error('[ML Server] Error starting server:', error);
    if (mlServerProcess) {
      mlServerProcess.kill();
      mlServerProcess = null;
    }
    throw error;
  }
};

/**
 * Get the ML server process reference (for testing/debugging)
 * @returns {ChildProcess|null}
 */
export const getMLServerProcess = () => {
  return mlServerProcess;
};

