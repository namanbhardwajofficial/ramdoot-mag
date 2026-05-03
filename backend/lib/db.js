import { USERS } from '../config/magazines.js';

// Simple in-memory database
class DB {
    constructor() {
        this.users = [...USERS];
        this.otps = new Map(); // Store OTPs temporarily
    }

    getUsers() {
        return this.users;
    }

    findUserByEmail(email) {
        return this.users.find(u => u.email === email);
    }

    addUser(user) {
        this.users.push(user);
        return user;
    }

    setOTP(email, otp) {
        this.otps.set(email, {
            otp,
            expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });
    }

    getOTP(email) {
        return this.otps.get(email);
    }

    deleteOTP(email) {
        this.otps.delete(email);
    }
}

const db = new DB();
export default db;
