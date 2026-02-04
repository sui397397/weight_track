const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authenticateToken } = require('../middleware/auth');

// すべてのルートに認証が必要
router.use(authenticateToken);

// 記録を保存
router.post('/create', recordController.createRecord);

// 今日の記録を取得
router.get('/today', recordController.getTodayRecord);

// 特定の日付の記録を取得 ← これを追加
router.get('/date/:date', recordController.getRecordByDate);

// 最近の記録を取得
router.get('/recent', recordController.getRecentRecords);

// すべての記録を取得
router.get('/all', recordController.getAllRecords);

// 特定の日付の記録を取得
exports.getRecordByDate = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date } = req.params;

        const [records] = await db.query(
            'SELECT * FROM weight_records WHERE user_id = ? AND record_date = ?',
            [userId, date]
        );

        if (records.length > 0) {
            res.status(200).json({
                success: true,
                record: records[0]
            });
        } else {
            res.status(200).json({
                success: false,
                message: '記録が見つかりません'
            });
        }

    } catch (error) {
        console.error('Get record by date error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

module.exports = router;