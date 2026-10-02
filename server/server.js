import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { startEscalationJob } from './jobs/escalationJob.js';

const PORT = process.env.PORT || 5000;

// Initialize Server
const startServer = async () => {
  // Connect to database
  await connectDB();

  // Start background cron jobs
  startEscalationJob();

  const server = app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 CivicSetu API Server running on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'rule'}`);
    console.log(`=================================================\n`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
};

startServer();
