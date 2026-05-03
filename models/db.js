import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.htlhbmjpmzivyunjcpsf:mQv%2BqcXTp%26S9cY-@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;