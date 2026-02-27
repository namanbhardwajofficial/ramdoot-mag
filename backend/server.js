import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from 'dotenv';
import { MAGAZINES, ORG } from './config/magazines.js';
import subscriptionRoutes from './routes/subscriptions.js';
import paymentRoutes from './routes/payments.js';
import publicationRoutes from './routes/publications.js';
import userRoutes from './routes/users.js';
import themeRoutes from './routes/theme.js';
import apiLimiter from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get('/magazines', (_req, res) => {
  res.json(MAGAZINES);
});

app.post('/create-order', async (req, res) => {
  try {
    const { magazineId } = req.body;

    const magazine = MAGAZINES.find((m) => m.id === magazineId);
    if (!magazine) {
      return res.status(404).json({ message: 'Magazine not found' });
    }

    const order = await razorpay.orders.create({
      amount: magazine.price * 100,
      currency: ORG.currency,
      receipt: `mag_${magazine.id}_${Date.now()}`,
      notes: {
        magazineId: String(magazine.id),
        magazineTitle: magazine.title,
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      magazineId: magazine.id,
      magazineTitle: magazine.title,
    });
  } catch (err) {
    console.error('Error creating Razorpay order', err);
    res.status(500).json({ message: 'Unable to create order' });
  }
});

app.post('/verify-payment', (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      magazineId,
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ status: 'error', message: 'Server misconfigured' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac('sha256', secret)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ status: 'failure' });
    }

    const magazine = MAGAZINES.find((m) => m.id === magazineId);

    console.log(
      `Payment verified — order: ${razorpay_order_id}, payment: ${razorpay_payment_id}, magazine: ${magazine?.title ?? magazineId}`
    );

    return res.json({
      status: 'success',
      magazineId,
      magazineTitle: magazine?.title,
    });
  } catch (err) {
    console.error('Error verifying Razorpay payment', err);
    res.status(500).json({ status: 'error' });
  }
});

app.use('/subscriptions', subscriptionRoutes);
app.use('/payments', paymentRoutes);
app.use('/publications', publicationRoutes);
app.use('/users', userRoutes);
app.use('/theme', themeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
