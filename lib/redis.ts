// but will be deprecated in the next major version.
import Redis from 'ioredis'

// Create a Redis instance.
// By default, it will connect to localhost:6379.
// We are going to cover how to specify connection options soon.
export const redis = new Redis({
  host: 'redis'
})