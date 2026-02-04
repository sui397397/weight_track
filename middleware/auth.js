const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWTトークンを検証するミドルウェア
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: '認証トークンが必要です' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'トークンが無効です' 
            });
        }
        
        req.user = user;
        next();
    });
};

// JWTトークンを生成する関数
const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

module.exports = { authenticateToken, generateToken };