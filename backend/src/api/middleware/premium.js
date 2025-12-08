/**
 * Check if user has premium subscription
 */
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required' },
    });
  }

  const isPremium = req.user.subscription_status === 'premium' || 
                    req.user.subscription_status === 'premium_annual' ||
                    req.user.role === 'admin';

  // Check if subscription is expired
  if (req.user.subscription_expires_at) {
    const expiresAt = new Date(req.user.subscription_expires_at);
    const now = new Date();
    
    if (expiresAt < now && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { 
          message: 'Premium subscription expired',
          code: 'PREMIUM_EXPIRED'
        },
      });
    }
  }

  if (!isPremium) {
    return res.status(403).json({
      success: false,
      error: { 
        message: 'Premium subscription required',
        code: 'PREMIUM_REQUIRED'
      },
    });
  }

  next();
};

module.exports = { requirePremium };
