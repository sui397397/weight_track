const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');

// すべてのルートに認証を適用
router.use(authenticateToken);

// プライバシー設定取得
router.get('/privacy', settingsController.getPrivacySettings);

// プライバシー設定更新
router.put('/privacy', settingsController.updatePrivacySettings);

module.exports = router;