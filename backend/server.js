// server.js
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const magazines = [
  {
    id: 1,
    title: 'Ramdoot August 2026 Edition',
    description: 'Curated magazines delivering insights, trends, and inspiration across technology and design.',
    image: '',
    price: 5,
  },
  {
    id: 2,
    title: 'Ramdoot July 2026 Edition',
    description: 'A collection of long-form essays and visual stories on modern product design.',
    image: '',
    price: 10,
  },
  {
    id: 3,
    title: 'Ramdoot June 2026 Edition',
    description: 'Features on web performance, accessibility, and the future of front-end tooling.',
    image: '',
    price: 15,
  },
  {
    id: 4,
    title: 'Ramdoot May 2026 Edition',
    description: 'Interviews with creators, makers, and engineers shipping delightful products.',
    image: '',
    price: 20,
  },
];

app.get('/magazines', (_req, res) => {
  res.json(magazines);
});

// Create order
app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt_order_1' } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Error creating Razorpay order', err);
    res.status(500).json({ message: 'Unable to create order' });
  }
});

// Verify payment
app.post('/verify-payment', (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign === razorpay_signature) {
      return res.json({ status: 'success' });
    }

    return res.status(400).json({ status: 'failure' });
  } catch (err) {
    console.error('Error verifying Razorpay payment', err);
    res.status(500).json({ status: 'error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});