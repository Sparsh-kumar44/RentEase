import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: 'db.htlhbmjpmzivyunjcpsf.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'mQv+qcXTp&S9cY-',
    database: 'postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;