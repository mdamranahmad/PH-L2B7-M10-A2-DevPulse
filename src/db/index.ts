import { Pool } from "pg";
import { config } from "../config";

// a variable that creat an instance of class Pool with databse url as argument, to create a connection to neonDB when initiated
const pool = new Pool({
  connectionString: config.database_url,
});

// Declaration of database and it's table
export const initDB = async () => {
  // creates a table named 'users(id, name, email, password, role, created_at, updated_at)
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,

        password_hash TEXT NOT NULL,

        role VARCHAR(20) DEFAULT 'contributor' NOT NULL CONSTRAINT check_user_role CHECK(role IN('contributor', 'maintainer')),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        

        )
        `);

  await pool.query(`
        CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT, 

        type VARCHAR(25) NOT NULL CONSTRAINT check_type CHECK(type IN('bug', 'feature_request')),

        status VARCHAR(20) DEFAULT 'open' NOT NULL CONSTRAINT check_status CHECK(status in ('open', 'in_progress', 'resolved')),

        reported_id INT REFERENCES users(id) ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        

        )
        `);
  console.log("Database Connected Successfully.");
};
