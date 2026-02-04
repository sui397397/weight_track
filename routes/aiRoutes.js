const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// すべてのルートに認証が必要
router.use(authenticateToken);

// AIアドバイスを取得
router.get('/advice', aiController.getAdvice);

// カスタム質問
router.post('/ask', aiController.askQuestion);

// チャット（新しいエンドポイント - Gemini API使用）
router.post('/chat', aiController.chat);

// 会話履歴を取得
router.get('/conversations', aiController.getConversations);

// 食事画像を解析
router.post('/analyze-food', aiController.analyzeFoodImage);

module.exports = router;