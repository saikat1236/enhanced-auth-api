const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { ensureAuthenticated, ensureAdmin,protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllUsers } = require('../controllers/userController');


const router = express.Router();

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limits file size to 1MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('profilePhoto'); // 'profilePhoto' is the name attribute in the form

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extensions
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Profile view route
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.visibility === 'public' || req.user.role === 'admin' || req.user.id === user.id) {
      res.json(user);
    } else {
      res.status(403).send('Profile is private.');
    }
  } catch (error) {
    res.status(404).send('User not found.');
  }
});

// Edit profile route
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  if (req.params.id === req.user.id || req.user.role === 'admin') {
    const user = await User.findById(req.params.id);
    if (user) {
      res.render('editProfile', { user });
    } else {
      res.status(404).send('User not found.');
    }
  } else {
    res.status(403).send('Unauthorized.');
  }
});

// Update profile route
router.post('/update/:id', ensureAuthenticated, upload, async (req, res) => {
  const { name, email, bio, phone, visibility } = req.body;
  const updates = {
    name,
    email,
    bio,
    phone,
    visibility
  };

  if (req.file) {
    updates.profilePhoto = `/uploads/${req.file.filename}`;
  }

  try {
    const user = await User.findOneAndUpdate({ _id: req.params.id }, updates, { new: true });
    res.redirect(`/profile/${user.id}`);
  } catch (error) {
    res.status(400).send('Error updating profile.');
  }
});

// List public profiles route
router.get('/list/public', async (req, res) => {
  const users = await User.find({ visibility: 'public' }).select('-password');
  res.json(users);
});

// router.get('/all', protect, adminOnly, getAllUsers);

module.exports = router;
