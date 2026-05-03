import express from 'express';
import { addProperty, getPropertiesByHost, getPropertyById, updateProperty, deleteProperty } from '../models/propertyModel.js';
import { getBookingsByOwner, getRevenueByOwner } from '../models/bookingModel.js';
import { updateUser, findUser } from '../models/userModel.js';

const router = express.Router();

const requireOwner = (req, res, next) => {
    if (!req.session.user) return res.redirect('/');
    if (req.session.user.role !== 'owner') return res.redirect('/customer/dashboard');
    next();
};

// Dashboard
router.get('/dashboard', requireOwner, async (req, res) => {
    try {
        const properties = await getPropertiesByHost(req.session.user.id);
        const bookings = await getBookingsByOwner(req.session.user.id);
        const today = new Date();
        const activeBookings = bookings.filter(b => new Date(b.checkin) <= today && new Date(b.checkout) >= today).length;

        res.render('ownerDashboard', {
            user: req.session.user,
            totalProperties: properties.length,
            activeBookings,
            totalBookings: bookings.length,
            revenue: 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading dashboard');
    }
});

// Properties list
router.get('/properties', requireOwner, async (req, res) => {
    try {
        const properties = await getPropertiesByHost(req.session.user.id);
        res.render('ownerProperties', { properties, user: req.session.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading properties');
    }
});

// Add property - GET
router.get('/add-property', requireOwner, (req, res) => {
    res.render('addProperty', { user: req.session.user, error: null });
});

// Add property - POST
router.post('/add-property', requireOwner, async (req, res) => {
    try {
        const { name, location, price, type, rooms, toilets, pools, parking } = req.body;
        await addProperty(req.session.user.id, name, location, price, type, rooms, toilets, pools, parking);
        res.redirect('/owner/properties');
    } catch (err) {
        console.error(err);
        res.render('addProperty', { user: req.session.user, error: err.message });
    }
});

// Edit property - GET
router.get('/edit-property/:id', requireOwner, async (req, res) => {
    try {
        const property = await getPropertyById(req.params.id);
        if (!property || property.host_id !== req.session.user.id) return res.redirect('/owner/properties');
        res.render('editProperty', { property, user: req.session.user, error: null });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading property');
    }
});

// Edit property - POST
router.post('/edit-property/:id', requireOwner, async (req, res) => {
    try {
        const { name, location, price, type, rooms, toilets, pools, parking } = req.body;
        await updateProperty(req.params.id, req.session.user.id, name, location, price, type, rooms, toilets, pools, parking);
        res.redirect('/owner/properties');
    } catch (err) {
        console.error(err);
        const property = await getPropertyById(req.params.id);
        res.render('editProperty', { property, user: req.session.user, error: err.message });
    }
});

// Delete property
router.post('/delete-property/:id', requireOwner, async (req, res) => {
    try {
        await deleteProperty(req.params.id, req.session.user.id);
        res.redirect('/owner/properties');
    } catch (err) {
        console.error(err);
        res.redirect('/owner/properties');
    }
});

// Bookings
router.get('/bookings', requireOwner, async (req, res) => {
    try {
        const bookings = await getBookingsByOwner(req.session.user.id);
        const today = new Date();
        const upcoming = bookings.filter(b => new Date(b.checkin) > today);
        const active = bookings.filter(b => new Date(b.checkin) <= today && new Date(b.checkout) >= today);
        const past = bookings.filter(b => new Date(b.checkout) < today);
        res.render('ownerBookings', { bookings, upcoming, active, past, user: req.session.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading bookings');
    }
});

// Revenue
router.get('/revenue', requireOwner, async (req, res) => {
    try {
        const revenueByProperty = await getRevenueByOwner(req.session.user.id);
        const total = revenueByProperty.reduce((sum, r) => sum + r.amount, 0);
        const totalBookings = revenueByProperty.reduce((sum, r) => sum + r.bookingCount, 0);
        res.render('revenue', { user: req.session.user, revenueByProperty, total, totalBookings });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading revenue');
    }
});

// Profile - GET
router.get('/profile', requireOwner, (req, res) => {
    res.render('ownerProfile', { user: req.session.user, error: null, success: null });
});

// Profile - POST (update)
router.post('/profile', requireOwner, async (req, res) => {
    try {
        const { fullname, username } = req.body;

        const existing = await findUser(username);
        if (existing && existing.id !== req.session.user.id) {
            return res.render('ownerProfile', { user: req.session.user, error: 'Username already taken', success: null });
        }

        const updated = await updateUser(req.session.user.id, fullname, username);
        req.session.user = { ...req.session.user, fullname: updated.fullname, username: updated.username };

        res.render('ownerProfile', { user: req.session.user, error: null, success: 'Profile updated successfully!' });
    } catch (err) {
        console.error(err);
        res.render('ownerProfile', { user: req.session.user, error: 'Update failed. Try again.', success: null });
    }
});

export default router;
