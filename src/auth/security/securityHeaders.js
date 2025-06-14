/**
 * Configure security headers middleware
 * @param {Object} app - Express app
 */
module.exports = (app) => {
  // Set security headers for all responses
  app.use((req, res, next) => {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none'; " +
      "form-action 'self';"
    );

    // HTTP Strict Transport Security
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );

    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options
    res.setHeader('X-Frame-Options', 'DENY');

    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Feature-Policy
    res.setHeader(
      'Feature-Policy',
      "camera 'none'; microphone 'none'; geolocation 'none'"
    );

    // Permissions-Policy (newer version of Feature-Policy)
    res.setHeader(
      'Permissions-Policy',
      "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );

    // Cache-Control for auth routes
    if (req.path.startsWith('/api/auth/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }

    next();
  });
};