import express from 'express';
import bcrypt from 'bcrypt';
import { createUser, findUser } from '../models/userModel.js';

const router = express.Router();

router.get('/', (req, res) => res.render('login', { error: null }));
router.get('/register', (req, res) => res.render('register', { error: null }));

router.post('/register', async (req, res) => {
    try {
        const { fullname, username, password, confirmPassword, role } = req.body;

        if (password !== confirmPassword) {
            return res.render('register', { error: 'Passwords do not match' });
        }
        if (password.length < 6) {
            return res.render('register', { error: 'Password must be at least 6 characters' });
        }

        const existing = await findUser(username);
        if (existing) {
            return res.render('register', { error: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(fullname, username, hashedPassword, role || 'customer');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Registration failed. Please try again.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await findUser(username);

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            if (user.role === 'owner') {
                return res.redirect('/owner/dashboard');
            } else {
                return res.redirect('/customer/dashboard');
            }
        }

        res.render('login', { error: 'Invalid username or password' });
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Login failed. Please try again.' });
    }
});

export default router;
