import db from './db.js';

export const getBookingsByUser = async (userId) => {
    const result = await db.query(
        `SELECT b.*, p.name as property_name, p.location, p.type, p.price 
         FROM bookings b
         JOIN properties p ON b.property_id = p.id
         WHERE b.user_id = $1 ORDER BY b.checkin DESC`,
        [userId]
    );
    return result.rows;
};

export const getBookingsByOwner = async (ownerId) => {
    const result = await db.query(
        `SELECT b.*, p.name as property_name, p.location, u.fullname as guest_name, u.username as guest_username
         FROM bookings b
         JOIN properties p ON b.property_id = p.id
         JOIN users u ON b.user_id = u.id
         WHERE p.host_id = $1 ORDER BY b.checkin DESC`,
        [ownerId]
    );
    return result.rows;
};

export const createBooking = async (userId, propertyId, checkin, checkout) => {
    const conflict = await db.query(
        `SELECT id FROM bookings 
         WHERE property_id = $1 
         AND NOT (checkout <= $2 OR checkin >= $3)`,
        [propertyId, checkin, checkout]
    );

    if (conflict.rows.length > 0) {
        throw new Error('Property is already booked for the selected dates');
    }

    const result = await db.query(
        'INSERT INTO bookings (user_id, property_id, checkin, checkout) VALUES ($1,$2,$3,$4) RETURNING *',
        [userId, propertyId, checkin, checkout]
    );
    return result.rows[0];
};

export const cancelBooking = async (id, userId) => {
    await db.query('DELETE FROM bookings WHERE id=$1 AND user_id=$2', [id, userId]);
};

export const getRevenueByOwner = async (ownerId) => {
    // Only count completed bookings (checkout date has passed)
    const result = await db.query(
        `SELECT 
            p.id,
            p.name        AS property,
            p.type,
            p.price,
            COUNT(b.id)   AS booking_count,
            COALESCE(SUM(DATE_PART('day', b.checkout::timestamp - b.checkin::timestamp)), 0) AS nights
         FROM properties p
         LEFT JOIN bookings b ON b.property_id = p.id AND b.checkout < NOW()
         WHERE p.host_id = $1
         GROUP BY p.id, p.name, p.type, p.price
         ORDER BY nights DESC`,
        [ownerId]
    );

    const rows = result.rows.map(r => ({
        property:     r.property,
        type:         r.type,
        bookingCount: parseInt(r.booking_count),
        nights:       parseInt(r.nights),
        amount:       parseInt(r.nights) * parseFloat(r.price)
    }));

    return rows.filter(r => r.bookingCount > 0);
};
