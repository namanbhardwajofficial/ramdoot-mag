import express from "express";
import cors from "cors";

// Import routes
import userRoutes from './routes/users.js';
import publicationRoutes from './routes/publications.js';
import subscriptionRoutes from './routes/subscriptions.js';
import paymentRoutes from './routes/payments.js';
import influencerRoutes from './routes/influencers.js';
import campaignRoutes from './routes/campaigns.js';
import themeRoutes from './routes/theme.js';
import authRoutes from './routes/auth.js';

const app = express();

// Middleware
app.use(cors()); // Allow frontend to call backend
app.use(express.json());

// Register Routes
app.use('/users', userRoutes);
app.use('/magazines', publicationRoutes);
app.use('/publications', publicationRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/payments', paymentRoutes);
app.use('/influencers', influencerRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/theme', themeRoutes);
app.use('/auth', authRoutes);

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'hi' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});