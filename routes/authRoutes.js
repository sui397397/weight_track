const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ユーザー登録
router.post('/register', authController.register);

// ユーザーログイン
router.post('/login', authController.login);

module.exports = router;