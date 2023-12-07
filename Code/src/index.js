// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);



// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************
app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});


app.get('/register', (req, res) => {
  res.render('pages/register')
});


// Register
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  try {
    if (!req.body.username || !req.body.password || !req.body.email) {
      return res.render("pages/register", {
        error: true,
        message: "Missing required fields",
      });
    }
    const hash = await bcrypt.hash(req.body.password, 10);

    // To-DO: Insert username and hashed password into the 'users' table
    await db.none(`INSERT INTO users(username, email, password) VALUES ($1, $2, $3)`,
      [req.body.username, req.body.email, hash]);
    res.redirect('/login');

  } catch (error) {
    res.render("pages/register", {
      error: true,
      message: error.message,
    });
  }
});


app.get('/login', (req, res) => {
  res.render('pages/login')
});



app.post('/login', async (req, res) => {
  //hash the password using bcrypt library
  try {
    const query = `select * from users where username = $1`;
    // To-DO: Insert username and hashed password into the 'users' table
    const user = await db.oneOrNone(query, req.body.username);
    if (!user) {
      return res.status(401).render('pages/register', {
        error: true,
        message: "Incorrect username or password."
      });
    }
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(401).render('pages/register', {
        error: true,
        message: "Incorrect username or password."
      });
    }
    req.session.user = user;
    req.session.save();
    res.redirect('/home');
  } catch (error) {
    res.render("pages/register", {
      error: true,
      message: error.message,
    });
  }
});
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};
app.use(auth);


const all_jobs = `SELECT * FROM jobs`



app.get('/home', (req, res) => {
  res.render('pages/home')
});
app.get('/post', (req, res) => {
  res.render('pages/post')
});

app.get('/about', (req, res) => {
  res.render('pages/about')
});

app.get('/jobs', async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const sort = req.query.sort;
    let jobs;

    let query = 'SELECT * FROM jobs';
    let queryParams = [];

    if (searchQuery) {
      query += ` WHERE (name ILIKE $1 OR description ILIKE $1)`;
      queryParams.push(`%${searchQuery}%`);
    }
    if (sort) {
      switch (sort) {
        case 'favorites':
          query += searchQuery ? ' AND' : ' WHERE';
          query += ' is_favorite = TRUE';
          break;
        case 'price_high':
          query += ' ORDER BY price DESC';
          break;
        case 'price_low':
          query += ' ORDER BY price ASC';
          break;
        case 'newest':
          query += ' ORDER BY posted_on DESC';
          break;
        case 'oldest':
          query += ' ORDER BY posted_on ASC';
          break;
      }
    }

    if (!sort) {
      query += ' ORDER BY posted_on DESC';
    }

    jobs = await db.any(query, queryParams);

    res.render('pages/jobs', { 
      jobs: jobs, 
      currentUser: req.session.user 
    });
  } catch (error) {
    console.error('ERROR:', error.message || error);
    res.status(500).send('Error retrieving jobs');
  }
});




// POST route for submitting a job
app.post('/submit-job', async (req, res) => {
  try {
    const { jobTitle, jobDescription, jobLocation, jobSalary } = req.body;

    const insertJobQuery = `
      INSERT INTO jobs (name, description,location, requester, email, price)
      VALUES ($1, $2, $3, $4, $5,$6);`;

    await db.none(insertJobQuery, [
      jobTitle,
      jobDescription,
      jobLocation,
      req.session.user.username,
      req.session.user.email,
      jobSalary
    ]);

    res.redirect('/jobs');
  } catch (error) {
    console.error('Error posting job:', error.message || error);
    res.status(500).send('Error posting job: ' + error.message);
  }
});

// DELETE route for deleting a job
app.get('/delete-job/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const job = await db.oneOrNone('SELECT * FROM jobs WHERE job_id = $1', jobId);

    if (!job) {
      return res.status(404).send('Job not found');
    }

    if (req.session.user && req.session.user.username === job.requester) {
      await db.none('DELETE FROM jobs WHERE job_id = $1', jobId);
      res.redirect('/jobs');
    } else {
      res.status(403).send('Unauthorized to delete this job');
    }
  } catch (error) {
    console.error('Error deleting job:', error.message || error);
    res.status(500).send('Error deleting job: ' + error.message);
  }
});

app.post('/toggle-favorite/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const toggleFavoriteQuery = `UPDATE jobs SET is_favorite = NOT is_favorite WHERE job_id = $1`;
    await db.none(toggleFavoriteQuery, [jobId]);
    res.redirect('/jobs');
  } catch (error) {
    console.error('Error toggling favorite status:', error.message);
    res.status(500).send('Error toggling favorite status');
  }
});
app.post('/update-profile', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let hashedPassword = password ? await bcrypt.hash(password, 10) : req.session.user.password;

    await db.none(`UPDATE users SET username = $1, email = $2, password = $3 WHERE username = $4`, [username, email, hashedPassword, req.session.user.username]);

    // Update session information
    req.session.user.username = username;
    req.session.user.email = email;
    req.session.user.password = hashedPassword;

    res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).send('Error updating profile');
  }
});
app.get('/profile', async (req, res) => {
  try {
    const userJobs = await db.any('SELECT * FROM jobs WHERE requester = $1', [req.session.user.username]);
    res.render('pages/profile', { 
      username: req.session.user.username,
      email: req.session.user.email,
      userJobs: userJobs 
    }); 
  } catch (error) {
    console.error('Error fetching user jobs:', error.message);
    res.status(500).send('Error fetching your jobs');
  }
});




// API route for Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect('/');
    }

    res.render('pages/login', { message: 'Logged out Successfully' });
  });
});

app.get('/myjobs', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).send('User not logged in');
    }

    const userJobs = await db.any('SELECT * FROM jobs WHERE requester = $1', [req.session.user.username]);
    res.render('pages/myjobs', { userJobs: userJobs }); 
  } catch (error) {
    console.error('Error fetching user jobs:', error.message);
    res.status(500).send('Error fetching your jobs');
  }
});



// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');