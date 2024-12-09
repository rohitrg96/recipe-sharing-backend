import NodeCache from 'node-cache';

// Initialize Node-Cache with TTL in seconds
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

export default cache;
