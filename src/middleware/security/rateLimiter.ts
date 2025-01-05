import rateLimit from 'express-rate-limit';

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "You've made too many requests in a short period. Please wait a few minutes and try again.",
  headers: true,
});

export default limiter;
