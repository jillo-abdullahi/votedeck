import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

if (!process.env.REDIS_URL) {
    console.warn('⚠️  REDIS_URL is missing. Defaulting to localhost.');
}

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    // Add family: 0 to fallback between IPv4/IPv6 (helps with Upstash/Railway)
    family: 0,
    // Explicitly enable TLS if using rediss protocol
    tls: redisUrl.startsWith('rediss://') ? {
        rejectUnauthorized: false
    } : undefined,
    // Stability settings for cloud Redis
    connectTimeout: 20000,
    keepAlive: 10000, // Send keepalive every 10s
    retryStrategy(times) {
        // Linear backoff: 50ms, 100ms, 150ms... maxing at 2s
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redis.on('connect', () => {
    console.log('📡 Connected to Redis');
});

redis.on('error', (err: Error) => {
    console.error('❌ Redis connection error:', err);
});
