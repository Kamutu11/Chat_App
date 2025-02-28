import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import logger from '../config/logger.js';

dotenv.config();

const router = express.Router();

router.post(
    '/register',
    [
        body('username').isString().notEmpty().trim(),
        body('password').isString().isLength({ min: 6 })
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { username, password } = req.body;
            const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
            if (rows.length > 0) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
            res.status(201).json({ message: 'User registered successfully' });
        } catch (err) {
            logger.error(err);
            next(err);
        }
    }
);

router.post(
    '/login',
    [
        body('username').isString().notEmpty().trim(),
        body('password').isString().notEmpty()
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { username, password } = req.body;
            const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
            if (rows.length === 0)
                return res.status(400).json({ message: 'User not found' });
            const user = rows[0];
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword)
                return res.status(400).json({ message: 'Invalid credentials' });
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.json({ token });
        } catch (err) {
            logger.error(err);
            next(err);
        }
    }
);

export default router;
