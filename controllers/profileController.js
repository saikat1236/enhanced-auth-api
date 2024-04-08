const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.profilePublic || req.user.roles.includes('admin')) {
      res.json(user);
    } else {
      res.status(403).send('You do not have permission to view this profile');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
