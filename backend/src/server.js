const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const newsletterRoutes = require('./routes/newsletter');
const ebookRoutes = require('./routes/ebook');
const contentRoutes = require('./routes/content');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const usersRoutes = require('./routes/usersRoutes');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// Trust proxy (for real IP behind reverse proxy/CDN)
app.set('trust proxy', 1);

// CORS configuration - Whitelist only allowed origins
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://solarbuyside.com.br,https://www.solarbuyside.com.br').split(',');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting - Global (relaxed)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15min
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting - Public endpoints (strict)
const publicLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 submissions per 10min per IP
  message: { success: false, message: 'Too many submissions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting - Auth endpoints (moderate)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 login attempts per 15min
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting - Analytics endpoints (prevent spam)
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 events per minute per IP
  message: { success: false, message: 'Too many analytics events, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', globalLimiter);

// Body parser middleware (using Express built-in)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/newsletter', publicLimiter, newsletterRoutes);
app.use('/api/ebook', publicLimiter, ebookRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsLimiter, analyticsRoutes);
app.use('/api/admin', authLimiter, adminRoutes);
app.use('/api/users', authLimiter, usersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Solar Buy-Side API Server            ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║   🚀 Server running on port ${PORT}      ║`);
  console.log(`║   🌍 Environment: ${process.env.NODE_ENV || 'development'}       ║`);
  console.log(`║   📅 Started at: ${new Date().toLocaleString()}  ║`);
  console.log('╚════════════════════════════════════════╝');
});

module.exports = app;
