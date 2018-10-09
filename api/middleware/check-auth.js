const jwt = require('jsonwebtoken');
require('./../../env');

module.exports = (req, res, next) => {
    try {

        const tokenHeader = req.headers.authorization;

        if(tokenHeader !== undefined){
            const tokenArray = tokenHeader.split(' ');
            const token = tokenArray[1];
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            req.userData = decoded;
            next();
        }
        else{
            res.sendStatus(403);
        }
    } catch (error) {
        res.status(403).json({
            err : error
        });
        return res;
    }
};