DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(50),
    email VARCHAR(100) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    rating DECIMAL,
    verified BOOL
);

DROP TABLE IF EXISTS jobs CASCADE;
CREATE TABLE jobs(
    name CHAR(50) ,
    job_id INTEGER PRIMARY KEY,
    description VARCHAR(200),
    requester VARCHAR(100),
    minPrice DECIMAL,
    maxPrice DECIMAL,
    FOREIGN KEY (requester) REFERENCES users(email)
);
