import express from 'express';
import bcrypt from 'bcrypt';
import { getBookingsByUser, createBooking, cancelBooking } from '../models/bookingModel.js';
import { getAllProperties, getPropertyById, searchProperties } from '../models/propertyModel.js';
import { updateUser, findUser } from '../models/userModel.js';

const router = express.Router();

const requireCustomer = (req, res, next) => {
    if (!req.session.user) return res.redirect('/');
    if (req.session.user.role === 'owner') return res.redirect('/owner/dashboard');
    next();
};

// Dashboard
router.get('/dashboard', requireCustomer, async (req, res) => {
    try {
        const bookings = await getBookingsByUser(req.session.user.id);
        const today = new Date();
        const totalBookings = bookings.length;
        const upcoming = bookings.filter(b => new Date(b.checkin) >= today).length;
        const past = bookings.filter(b => new Date(b.checkout) < today).length;

        res.render('customerDashboard', {
            user: req.session.user,
            totalBookings,
            upcoming,
            past
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading dashboard');
    }
});

// Search
router.get('/search', requireCustomer, async (req, res) => {
    try {
        const { q, type, minPrice, maxPrice } = req.query;
        const properties = await searchProperties(q, type, minPrice, maxPrice);
        res.render('search', { properties, query: q || '', type: type || 'all', minPrice: minPrice || '', maxPrice: maxPrice || '' });
    } catch (err) {
        console.error(err);
        res.render('search', { properties: [], query: '', type: 'all', minPrice: '', maxPrice: '' });
    }
});

// Property detail view
router.get('/property/:id', requireCustomer, async (req, res) => {
    try {
        const property = await getPropertyById(req.params.id);
        if (!property) return res.status(404).send('Property not found');
        res.render('property', { property, user: req.session.user, error: null, success: null });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading property');
    }
});

// Book a property
router.post('/property/:id/book', requireCustomer, async (req, res) => {
    try {
        const { checkin, checkout } = req.body;
        const property = await getPropertyById(req.params.id);
        if (!property) return res.status(404).send('Property not found');

        if (!checkin || !checkout || new Date(checkin) >= new Date(checkout)) {
            return res.render('property', { property, user: req.session.user, error: 'Invalid dates selected', success: null });
        }

        await createBooking(req.session.user.id, req.params.id, checkin, checkout);
        res.render('property', { property, user: req.session.user, error: null, success: 'Booking confirmed!' });
    } catch (err) {
        const property = await getPropertyById(req.params.id);
        res.render('property', { property, user: req.session.user, error: err.message, success: null });
    }
});

// Bookings list
router.get('/bookings', requireCustomer, async (req, res) => {
    try {
        const today = new Date();
        const bookings = await getBookingsByUser(req.session.user.id);
        const upcoming = bookings.filter(b => new Date(b.checkin) >= today);
        const past = bookings.filter(b => new Date(b.checkout) < today);
        res.render('bookings', { upcoming, past, user: req.session.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading bookings');
    }
});

// Cancel booking
router.post('/bookings/:id/cancel', requireCustomer, async (req, res) => {
    try {
        await cancelBooking(req.params.id, req.session.user.id);
        res.redirect('/customer/bookings');
    } catch (err) {
        console.error(err);
        res.redirect('/customer/bookings');
    }
});

// Profile - GET
router.get('/profile', requireCustomer, (req, res) => {
    res.render('profile', { user: req.session.user, error: null, success: null });
});

// Profile - POST (update)
router.post('/profile', requireCustomer, async (req, res) => {
    try {
        const { fullname, username, password, confirmPassword } = req.body;

        // Check username not taken by someone else
        const existing = await findUser(username);
        if (existing && existing.id !== req.session.user.id) {
            return res.render('profile', { user: req.session.user, error: 'Username already taken', success: null });
        }

        const updated = await updateUser(req.session.user.id, fullname, username);
        req.session.user = { ...req.session.user, fullname: updated.fullname, username: updated.username };

        res.render('profile', { user: req.session.user, error: null, success: 'Profile updated successfully!' });
    } catch (err) {
        console.error(err);
        res.render('profile', { user: req.session.user, error: 'Update failed. Try again.', success: null });
    }
});

export default router;
