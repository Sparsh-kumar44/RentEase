import db from './db.js';

export const createUser = async (fullname, username, password, role = 'customer') => {
    const result = await db.query(
        'INSERT INTO users (fullname, username, password, role) VALUES ($1,$2,$3,$4) RETURNING *',
        [fullname, username, password, role]
    );
    return result.rows[0];
};

export const findUser = async (username) => {
    const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );
    return result.rows[0];
};

export const findUserById = async (id) => {
    const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

export const updateUser = async (id, fullname, username) => {
    const result = await db.query(
        'UPDATE users SET fullname = $1, username = $2 WHERE id = $3 RETURNING *',
        [fullname, username, id]
    );
    return result.rows[0];
};

