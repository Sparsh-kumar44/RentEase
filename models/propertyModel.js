import db from './db.js';

export const addProperty = async (hostId, name, location, price, type, rooms, toilets, pools, parking) => {
    if (!hostId || !name || !location || !price || !type) {
        throw new Error('All required fields must be filled');
    }

    const result = await db.query(
        `INSERT INTO properties 
         (host_id, name, location, price, type, rooms, toilets, pools, parking) 
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [hostId, name, location, price, type, rooms || 1, toilets || 1, pools || 0, parking || 0]
    );
    return result.rows[0];
};

export const updateProperty = async (id, hostId, name, location, price, type, rooms, toilets, pools, parking) => {
    const result = await db.query(
        `UPDATE properties 
         SET name=$1, location=$2, price=$3, type=$4, rooms=$5, toilets=$6, pools=$7, parking=$8
         WHERE id=$9 AND host_id=$10 RETURNING *`,
        [name, location, price, type, rooms || 1, toilets || 1, pools || 0, parking || 0, id, hostId]
    );
    return result.rows[0];
};

export const deleteProperty = async (id, hostId) => {
    await db.query('DELETE FROM properties WHERE id=$1 AND host_id=$2', [id, hostId]);
};

export const getPropertiesByHost = async (hostId) => {
    const result = await db.query(
        'SELECT * FROM properties WHERE host_id = $1 ORDER BY id DESC',
        [hostId]
    );
    return result.rows;
};

export const getAllProperties = async () => {
    const result = await db.query('SELECT * FROM properties ORDER BY id DESC');
    return result.rows;
};

export const getPropertyById = async (id) => {
    const result = await db.query('SELECT * FROM properties WHERE id = $1', [id]);
    return result.rows[0];
};

export const searchProperties = async (query, type, minPrice, maxPrice) => {
    let sql = 'SELECT * FROM properties WHERE 1=1';
    const params = [];
    let idx = 1;

    if (query) {
        sql += ` AND (LOWER(name) LIKE $${idx} OR LOWER(location) LIKE $${idx})`;
        params.push(`%${query.toLowerCase()}%`);
        idx++;
    }
    if (type && type !== 'all') {
        sql += ` AND type = $${idx}`;
        params.push(type);
        idx++;
    }
    if (minPrice) {
        sql += ` AND price >= $${idx}`;
        params.push(Number(minPrice));
        idx++;
    }
    if (maxPrice) {
        sql += ` AND price <= $${idx}`;
        params.push(Number(maxPrice));
        idx++;
    }
    sql += ' ORDER BY id DESC';

    const result = await db.query(sql, params);
    return result.rows;
};
