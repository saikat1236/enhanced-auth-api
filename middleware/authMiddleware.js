const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }

    res.redirect('/users/login');
  };
  
  const forwardAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  };
  
  const ensureAdmin = (req, res, next) => {
    // Assuming the user's role is stored in `role` field
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }

    res.redirect('/dashboard');
  };
  
  module.exports = {
    ensureAuthenticated,
    forwardAuthenticated,
    ensureAdmin
  };
  