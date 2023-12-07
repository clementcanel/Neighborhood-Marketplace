INSERT INTO users (username, email, password, rating, verified) VALUES
('Bob', 'bob@gmail.com', 'bobp', 10.0, TRUE),
('Alice', 'alice@gmail.com', 'alicep', 5.0, FALSE),
('Joe', 'joe@gmail.com', 'joep', 5.0, TRUE);

INSERT INTO jobs (name, description,location, requester, email, price ) VALUES
( 'Paint my house', 'please paint my walls','Boulder' ,'Bob', 'bob@gmail.com', 1.0),
( 'Move my car', 'please move my car','Boulder' ,'Bob', 'bob@gmail.com', 2.0),
( 'Watch my kids', 'please watch my kids','Denver' ,'Alice', 'alice@gmail.com', 5.0),
( 'Clean my walls', 'please clean my walls','Denver' ,'Alice', 'alice@gmail.com', 100.0),
( 'help me with homework', 'i need help with homework','Boulder' ,'Joe', 'joe@gmail.com', 6097.0);

--('Mow my lawn', 2, 'please mow my lawn', 'alice@gmail.com', 9.5, 10.0);
