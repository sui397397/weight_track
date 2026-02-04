const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { authenticateToken } = require('../middleware/auth');

// すべてのルートに認証が必要
router.use(authenticateToken);

// 運動記録を保存
router.post('/create', exerciseController.createExerciseRecord);

// 今日の運動記録を取得
router.get('/today', exerciseController.getTodayExercises);

// 特定の日付の運動記録を取得
router.get('/date/:date', exerciseController.getExercisesByDate);

// 最近の運動記録を取得
router.get('/recent', exerciseController.getRecentExercises);

// 運動記録を削除
router.delete('/:exerciseId', exerciseController.deleteExerciseRecord);

module.exports = router;