import { registerAs } from '@nestjs/config';

export default registerAs('redis', (): Record<string, any> => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const driver =
        process.env.CACHE_DRIVER === 'redis'
            ? 'redis'
            : process.env.CACHE_DRIVER === 'auto'
              ? 'auto'
              : 'memory';
    return {
        url: redisUrl,
        driver,
        tls: redisUrl.startsWith('rediss://') ? {} : null,
    };
});
