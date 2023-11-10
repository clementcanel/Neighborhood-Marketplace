DROP TABLE IF EXISTS jobs CASCADE;
CREATE TABLE jobs(
    name CHAR(50) ,
    job_id INTEGER PRIMARY KEY,
    description VARCHAR(200),
    requester CHAR,
    minPrice INTEGER,
    maxPrice INTEGER,
    FOREIGN KEY (requester) REFERENCES users(email)
);

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username CHAR,
    email CHAR PRIMARY KEY,
    rating DECIMAL,
    verified BOOL,
);