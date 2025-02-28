import { createClient } from 'redis';
import logger from './logger.js';

const redisClient = createClient();

redisClient.on('error', (err) => {
    logger.error('Redis Client Error: ' + err);
});

await redisClient.connect();
export default redisClient;
