import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../lib/db.js';
import { USER_STATUSES } from '../config/magazines.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function signup(req, res) {
    const { fullName, email, phone, password, otp } = req.body;

    if (!fullName || !email || !password || !otp) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existing = db.findUserByEmail(email);
    if (existing) return res.status(400).json({ message: 'User already exists' });

    // Verify OTP
    const storedOtp = db.getOTP(email);
    if (!storedOtp || storedOtp.otp !== otp || storedOtp.expires < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
        id: `user_${Date.now().toString(36)}`,
        name: fullName,
        email,
        phone,
        password: hashedPassword,
        role: 'User',
        status: USER_STATUSES.ACTIVE,
        subscription: 'Free',
        subscriptionPlan: 'N/A',
        totalSpent: 0,
        lastActive: 'Just now',
        joinedOn: new Date().toISOString()
    };

    db.addUser(user);
    db.deleteOTP(email);

    // Generate Token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
    });
}

export async function login(req, res) {
    const { email, password } = req.body;

    const user = db.findUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    if (user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    } else {
        // Mock for dummy users: allow 'password' as the password
        if (password !== 'password') {
            return res.status(400).json({ message: 'Invalid credentials (dummy users use "password")' });
        }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
    });
}

export function sendOTP(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const otp = "000000"; // Constant for easier testing
    db.setOTP(email, otp);

    console.log(`[MOCK EMAIL] OTP for ${email}: ${otp}`);
    res.json({ message: 'OTP sent successfully (Hint: 000000)', otp });
}
