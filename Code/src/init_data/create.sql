DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(50) NOT NULL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password CHAR(60) NOT NULL,
    rating DECIMAL,
    verified BOOL
    
);

DROP TABLE IF EXISTS jobs CASCADE;
CREATE TABLE jobs(
    job_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    requester VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
    email VARCHAR(50) REFERENCES users(email) ON DELETE CASCADE,
    minPrice DECIMAL,
    maxPrice DECIMAL,
    posted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN DEFAULT FALSE
);
