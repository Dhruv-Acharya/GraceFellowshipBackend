const r = require('rethinkdb');
require('./../../env');

module.exports = (req, res, next) => {
    var connection = null;
    r.connect({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD }, function (err, conn) {
        if (err) throw err;
        req._dbconn = conn;
        next();
    });
}