import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const currentUserId = req.user.id;
    try {
        const [rows] = await pool.execute('SELECT id, username FROM users WHERE id != ?', [currentUserId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
