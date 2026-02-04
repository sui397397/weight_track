const db = require('../config/database');

// 体重記録を保存
exports.createRecord = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { weight, bodyFatPercentage, recordDate, memo } = req.body;

        // バリデーション
        if (!weight || !recordDate) {
            return res.status(400).json({
                success: false,
                message: '体重と日付は必須です'
            });
        }

        // 同じ日付の記録があるか確認
        const [existing] = await db.query(
            'SELECT record_id FROM weight_records WHERE user_id = ? AND record_date = ?',
            [userId, recordDate]
        );

        if (existing.length > 0) {
            // 既存の記録を更新
            await db.query(
                'UPDATE weight_records SET weight = ?, body_fat_percentage = ?, memo = ? WHERE user_id = ? AND record_date = ?',
                [weight, bodyFatPercentage, memo, userId, recordDate]
            );

            // アバター育成ポイントを加算（更新時もポイント付与）
            try {
                const gameController = require('./gameController');
                await gameController.addPoints({
                    user: req.user,
                    body: { points: 10, source: 'weight' }
                }, {
                    json: () => {}
                });
            } catch (error) {
                console.error('Game points error:', error);
            }

            return res.status(200).json({
                success: true,
                message: '記録を更新しました'
            });
        } else {
            // 新規記録を作成
            await db.query(
                'INSERT INTO weight_records (user_id, weight, body_fat_percentage, record_date, memo) VALUES (?, ?, ?, ?, ?)',
                [userId, weight, bodyFatPercentage, recordDate, memo]
            );

            // アバター育成ポイントを加算（新規作成時）
            try {
                const gameController = require('./gameController');
                await gameController.addPoints({
                    user: req.user,
                    body: { points: 10, source: 'weight' }
                }, {
                    json: () => {}
                });
            } catch (error) {
                console.error('Game points error:', error);
            }

            return res.status(201).json({
                success: true,
                message: '記録を保存しました'
            });
        }

    } catch (error) {
        console.error('Create record error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 今日の記録を取得
exports.getTodayRecord = async (req, res) => {
    try {
        const userId = req.user.userId;
        const today = new Date().toISOString().split('T')[0];

        const [records] = await db.query(
            'SELECT * FROM weight_records WHERE user_id = ? AND record_date = ?',
            [userId, today]
        );

        if (records.length > 0) {
            res.status(200).json({
                success: true,
                record: records[0]
            });
        } else {
            res.status(200).json({
                success: true,
                record: null
            });
        }

    } catch (error) {
        console.error('Get today record error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 最近の記録を取得（最新10件）
exports.getRecentRecords = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [records] = await db.query(
            'SELECT * FROM weight_records WHERE user_id = ? ORDER BY record_date DESC LIMIT 10',
            [userId]
        );

        res.status(200).json({
            success: true,
            records
        });

    } catch (error) {
        console.error('Get recent records error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// すべての記録を取得
exports.getAllRecords = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [records] = await db.query(
            'SELECT * FROM weight_records WHERE user_id = ? ORDER BY record_date ASC',
            [userId]
        );

        res.status(200).json({
            success: true,
            records
        });

    } catch (error) {
        console.error('Get all records error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

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