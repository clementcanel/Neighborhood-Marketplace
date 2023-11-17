DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100),
    password CHAR(60) NOT NULL,
    rating DECIMAL,
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
