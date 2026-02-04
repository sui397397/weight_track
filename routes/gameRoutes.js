const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticateToken } = require('../middleware/auth');

// すべてのルートに認証を適用
router.use(authenticateToken);

// 進捗取得
router.get('/progress', gameController.getProgress);

// バッジ一覧取得
router.get('/badges', gameController.getBadges);

// 連続記録取得
router.get('/streak', gameController.getStreak);

// 週間ランキング取得
router.get('/ranking/weekly', gameController.getWeeklyRanking);

// 月間ランキング取得
router.get('/ranking/monthly', gameController.getMonthlyRanking);

// ポイント加算
router.post('/add-points', gameController.addPoints);

// ログインボーナスチェック
router.post('/login-bonus', gameController.checkLoginBonus);

module.exports = router;