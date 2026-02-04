const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../config/multer');

// すべてのルートに認証が必要
router.use(authenticateToken);

// 食事記録を保存（画像アップロード対応）
router.post('/create', upload.single('mealImage'), mealController.createMealRecord);

// 今日の食事記録を取得
router.get('/today', mealController.getTodayMeals);

// 特定の日付の食事記録を取得
router.get('/date/:date', mealController.getMealsByDate);

// 最近の食事記録を取得
router.get('/recent', mealController.getRecentMeals);

// 食事記録を削除
router.delete('/:mealId', mealController.deleteMealRecord);

module.exports = router;