const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { authenticateToken } = require('../middleware/auth');

// すべてのルートに認証が必要
router.use(authenticateToken);

// 目標を作成
router.post('/create', goalController.createGoal);

// アクティブな目標を取得
router.get('/active', goalController.getActiveGoal);

// すべての目標を取得
router.get('/all', goalController.getAllGoals);

// 目標を削除
router.delete('/:goalId', goalController.deleteGoal);

module.exports = router;