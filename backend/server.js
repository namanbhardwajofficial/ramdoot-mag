import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors()); // Allow frontend to call backend
app.use(express.json());

// Single test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'hi' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});