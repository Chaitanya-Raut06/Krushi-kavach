import axios from "axios";

// 🌍 ML API running on Render
const ML_SERVER_URL = process.env.ML_SERVER_URL || 
  "https://krushi-ml-service.onrender.com";

// ----------------------------------------------------------------------
// 1️⃣ Check if ML Server on Render is awake
// ----------------------------------------------------------------------
export const checkMLServerStatus = async () => {
  try {
    const res = await axios.get(`${ML_SERVER_URL}/`, {
      timeout: 3000
    });

    return res.status === 200;
  } catch (err) {
    return false; // Render ML is sleeping or cold starting
  }
};

// ----------------------------------------------------------------------
// 2️⃣ Wait until Render wakes from sleep (cold start handler)
// ----------------------------------------------------------------------
export const waitForMLServer = async (maxWait = 60000) => {
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const alive = await checkMLServerStatus();
    if (alive) return true;

    await new Promise((r) => setTimeout(r, 1500));
  }

  return false;
};

// ----------------------------------------------------------------------
// 3️⃣ "Start" ML server on Render
//    (Actually → we just ping it until it wakes up)
// ----------------------------------------------------------------------
export const startMLServer = async () => {
  console.log("Waking ML server on Render...");

  const ready = await waitForMLServer();

  if (!ready) {
    throw new Error("ML server not waking up (Render cold start timeout)");
  }

  console.log("ML server is awake.");
};

// ----------------------------------------------------------------------
// 4️⃣ Predict function (Node → Render ML → Node → Frontend)
// ----------------------------------------------------------------------
export const runPrediction = async (imageBase64) => {
  try {
    const res = await axios.post(
      `${ML_SERVER_URL}/predict`,
      { image: imageBase64 },
      { timeout: 20000 }
    );

    return res.data;
  } catch (err) {
    console.error("Prediction error:", err.message);
    throw new Error("Failed to get prediction from ML server");
  }
};
