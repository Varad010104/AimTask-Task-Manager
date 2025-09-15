//This is the protecting the route
//From back movement also

// Middleware to protect routes
function protectReset(req, res, next) {
    if (!req.session.forgotPasswordEmail) {
      return res.redirect("/auth/forgot-password");
    }
    next();
  }
  
  function protectOtp(req, res, next) {
    if (!req.session.otpVerified) {
      return res.redirect("/auth/forgot-password");
    }
    next();
  }
  
  module.exports = {
    protectReset,
    protectOtp,
  };
  