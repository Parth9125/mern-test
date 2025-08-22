const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const listRoutes = require('./routes/lists');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

/**
 * CORS configuration (multi-origin, production-safe)
 * - Set CLIENT_URL in env as a comma-separated list of allowed origins
 *   e.g. CLIENT_URL=https://your-frontend.vercel.app,http://localhost:3000
 * - No trailing slashes in the origins
 * - This callback ensures the response contains EXACTLY ONE origin that matches the request
 */
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser clients (no Origin header) like curl/Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.length === 0) {
        // If no origins configured, default to blocking cross-origin in production
        // and allowing localhost for development.
        if (process.env.NODE_ENV !== 'production' && origin === 'http://localhost:3000') {
          return callback(null, true);
        }
        return callback(new Error('CORS: No allowed origins configured'), false);
      }

      if (allowedOrigins.includes(origin)) {
        // cors will set Access-Control-Allow-Origin to this single origin
        return callback(null, true);
      }

      return callback(new Error('CORS: Origin not allowed'), false);
    },
    // Use true only if you rely on cookies; for bearer tokens keep this false
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/lists', listRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MERN Stack Backend is running successfully!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MERN Test Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
