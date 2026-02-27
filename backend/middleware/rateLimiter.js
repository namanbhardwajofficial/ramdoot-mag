import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests — limit is 50 per second. Please try again shortly.',
  },
});

export default apiLimiter;
