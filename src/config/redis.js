  const {createClient}  = require('redis');

const redisclient = createClient({
    username: 'default',
    password: 'OxwwK2LClaWljyDbgGakXqf8NRYfOIo5',
    socket: {
        host: 'redis-10889.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 10889
    }
});
module.exports = redisclient;