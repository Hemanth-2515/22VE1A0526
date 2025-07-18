const axios = require('axios');
const LOG_API = 'http://20.244.56.144/evaluation-service/logs';

exports.logApi = (stack,level,package,message) => {
    axios.post(LOG_API, {
        stack,
        level,
        package: package,
        message
    }).catch(err => {
        console.error('Logging failed:', err.message);
    });
};