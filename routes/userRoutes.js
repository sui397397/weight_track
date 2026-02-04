const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// すべてのルートに認証が必要
router.use(authenticateToken);

// プロフィール情報を取得
router.get('/profile', userController.getProfile);

// プロフィール情報を更新
router.put('/profile', userController.updateProfile);

// パスワードを変更
router.put('/password', userController.changePassword);

// アカウントを削除
router.delete('/account', userController.deleteAccount);

module.exports = router;