const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// すべてのルートに認証が必要
router.use(authenticateToken);

// 通知設定を取得
router.get('/settings', notificationController.getSettings);

// 通知設定を更新
router.put('/settings', notificationController.updateSettings);

module.exports = router;