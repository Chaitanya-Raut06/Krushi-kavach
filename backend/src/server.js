import app from './app.js';
import connectDB from './config/db.js';
import { initializeAdmin } from './config/admin.init.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// --- Start Server ---
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Initialize admin user
    await initializeAdmin();

    // 3. Start Express server with increased timeout for file uploads
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`🌐 Visit: http://localhost:${PORT}`);
    });
    
    // Set server timeout to 350 seconds (higher than Cloudinary timeout)
    server.timeout = 350000;

  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

startServer();
