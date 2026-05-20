const jwt = require('jsonwebtoken')
const BackError = require('../utils/error')

const auth = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];;
    if (!token) {
        return res.status(401).json({message: 'No token given'})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (err) {
        next(new BackError(401, err, "TOKEN_INVALID"))
    }
}

module.exports = auth;