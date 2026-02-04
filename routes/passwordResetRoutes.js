const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

// パスワードリセットリクエスト
router.post('/request', passwordResetController.requestPasswordReset);

// トークンの有効性を確認
router.get('/verify/:token', passwordResetController.verifyResetToken);

// パスワードをリセット
router.post('/reset', passwordResetController.resetPassword);

module.exports = router;