const jwt = require('jsonwebtoken');
require('./../../env');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.BCRYPT_SALT_ROUNDS);
        req.userData = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            err : error
        });
        return res;
    }
};