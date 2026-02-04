const express = require('express');
const router = express.Router();
const healthMemoController = require('../controllers/healthMemoController');
const { authenticateToken } = require('../middleware/auth');

// すべてのルートに認証が必要
router.use(authenticateToken);

// 体調メモを保存
router.post('/create', healthMemoController.createHealthMemo);

// 特定日の体調メモを取得
router.get('/date/:date', healthMemoController.getMemoByDate);

// 最近の体調メモを取得
router.get('/recent', healthMemoController.getRecentMemos);

// 体調メモを更新
router.put('/:memoId', healthMemoController.updateHealthMemo);

// 体調メモを削除
router.delete('/:memoId', healthMemoController.deleteHealthMemo);

module.exports = router;