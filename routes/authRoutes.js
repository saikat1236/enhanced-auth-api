const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register Handler
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Check pass length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    // Validation passed
    User.findOne({ email: email }).then(user => {
      if (user) {
        // User exists
        errors.push({ msg: 'Email is already registered' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password // Password will be hashed before saving in User model
        });

        // Hash Password
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          // Set password to hashed
          newUser.password = hash;
          // Save user
          newUser.save()
            .then(user => {

              res.redirect('/users/login');
            })
            .catch(err => console.log(err));
        }));
      }
    });
  }
});

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Login Handler
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    // failureFlash: true
  })(req, res, next);
});

// Logout Handler
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/users/login');
});

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
});

module.exports = router;
