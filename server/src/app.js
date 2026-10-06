const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const donationRoutes = require('./routes/donationRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const requestRoutes = require('./routes/requestRoutes');
const handoverRoutes = require('./routes/handoverRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditRoutes = require('./routes/auditRoutes');
const { getPublicTrail } = require('./controllers/handoverController');

const app = express();

// Cross-Origin Resource Sharing
app.use(cors({
  origin: '*', // Allow frontend development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Healthcheck & metadata
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MedShare API',
    version: '1.0.0',
    disclaimer: 'Prototype platform: MedShare coordinates donation logistics and does not replace certified pharmacist dispensing or regulatory protocols.'
  });
});

// Public Batch Trail Endpoint (No Auth Required)
app.get('/api/trail/:trailId', getPublicTrail);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/handovers', handoverRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-events', auditRoutes);

// 404 Handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.baseUrl}`
  });
});

// Central Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'An unexpected server error occurred.'
  });
});

module.exports = app;
