const db = require('../config/database');

// 体調メモを保存
exports.createHealthMemo = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { memoDate, conditionRating, sleepHours, stressLevel, memo } = req.body;

        // バリデーション
        if (!memoDate) {
            return res.status(400).json({
                success: false,
                message: '日付は必須です'
            });
        }

        // 数値フィールドは空文字列をnullに変換
        const conditionValue = conditionRating || null;
        const sleepValue = sleepHours || null;
        const stressValue = stressLevel || null;
        const memoValue = memo || null;

        await db.query(
            'INSERT INTO health_memos (user_id, memo_date, condition_rating, sleep_hours, stress_level, memo) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, memoDate, conditionValue, sleepValue, stressValue, memoValue]
        );

        res.status(201).json({
            success: true,
            message: '体調メモを保存しました'
        });

    } catch (error) {
        console.error('Create health memo error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 特定日の体調メモを取得
exports.getMemoByDate = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date } = req.params;

        const [memos] = await db.query(
            'SELECT * FROM health_memos WHERE user_id = ? AND memo_date = ?',
            [userId, date]
        );

        res.status(200).json({
            success: true,
            memo: memos.length > 0 ? memos[0] : null
        });

    } catch (error) {
        console.error('Get memo by date error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 最近の体調メモを取得
exports.getRecentMemos = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [memos] = await db.query(
            'SELECT * FROM health_memos WHERE user_id = ? ORDER BY memo_date DESC LIMIT 30',
            [userId]
        );

        res.status(200).json({
            success: true,
            memos
        });

    } catch (error) {
        console.error('Get recent memos error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 体調メモを更新
exports.updateHealthMemo = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { memoId } = req.params;
        const { conditionRating, sleepHours, stressLevel, memo } = req.body;

        // 数値フィールドは空文字列をnullに変換
        const conditionValue = conditionRating || null;
        const sleepValue = sleepHours || null;
        const stressValue = stressLevel || null;
        const memoValue = memo || null;

        await db.query(
            'UPDATE health_memos SET condition_rating = ?, sleep_hours = ?, stress_level = ?, memo = ? WHERE memo_id = ? AND user_id = ?',
            [conditionValue, sleepValue, stressValue, memoValue, memoId, userId]
        );

        res.status(200).json({
            success: true,
            message: '体調メモを更新しました'
        });

    } catch (error) {
        console.error('Update health memo error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 体調メモを削除
exports.deleteHealthMemo = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { memoId } = req.params;

        await db.query(
            'DELETE FROM health_memos WHERE memo_id = ? AND user_id = ?',
            [memoId, userId]
        );

        res.status(200).json({
            success: true,
            message: '体調メモを削除しました'
        });

    } catch (error) {
        console.error('Delete health memo error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};