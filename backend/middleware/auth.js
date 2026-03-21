const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer '))
            token = req.headers.authorization.split(' ')[1];
        if (!token)
            return res.status(401).json({ error: 'You must be logged in.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wanderlux_secret_2025');
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ error: 'User no longer exists.' });

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    }
};

exports.restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(403).json({ error: 'Permission denied.' });
    next();
};