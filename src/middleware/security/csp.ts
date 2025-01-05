import helmet from 'helmet';

// Configure Content Security Policy (CSP)
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"], // Default to self for loading resources
    scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts
    objectSrc: ["'none'"], // Disallow plugin-based content
    imgSrc: ["'self'", 'data:'], // Allow images from same origin and data URIs
    styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
    fontSrc: ["'self'"], // Allow fonts from self
  },
};

// Apply helmet middleware to enforce security headers
export const applyCSP = helmet.contentSecurityPolicy(cspConfig);
