const db = require('../config/database');

// 目標を作成
exports.createGoal = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentWeight, targetWeight, startDate, endDate } = req.body;

        // バリデーション
        if (!currentWeight || !targetWeight || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'すべての項目を入力してください'
            });
        }

        // 既存のアクティブな目標を無効化
        await db.query(
            'UPDATE goals SET is_active = FALSE WHERE user_id = ? AND is_active = TRUE',
            [userId]
        );

        // 新しい目標を作成（start_weightを保存）
        const [result] = await db.query(
            'INSERT INTO goals (user_id, start_weight, target_weight, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
            [userId, currentWeight, targetWeight, startDate, endDate]
        );

        res.status(201).json({
            success: true,
            message: '目標を設定しました',
            goalId: result.insertId
        });

    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// アクティブな目標を取得
exports.getActiveGoal = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [goals] = await db.query(
            'SELECT * FROM goals WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        if (goals.length === 0) {
            return res.status(200).json({
                success: true,
                goal: null
            });
        }

        const goal = goals[0];

        // 現在の体重を取得（最新の記録）
        const [records] = await db.query(
            'SELECT weight FROM weight_records WHERE user_id = ? ORDER BY record_date DESC LIMIT 1',
            [userId]
        );

        // 開始時の体重（データベースに保存されている値、またはstart_date以前の記録）
        let startWeight = goal.start_weight; // データベースから取得
        
        if (!startWeight) {
            // start_weightがない場合は、start_date以前の記録から取得
            const [startRecords] = await db.query(
                'SELECT weight FROM weight_records WHERE user_id = ? AND record_date <= ? ORDER BY record_date DESC LIMIT 1',
                [userId, goal.start_date]
            );
            if (startRecords.length > 0) {
                startWeight = parseFloat(startRecords[0].weight);
            }
        }

        let progress = 0;
        let currentWeight = null;

        if (records.length > 0 && startWeight) {
            currentWeight = parseFloat(records[0].weight);
            const targetWeight = parseFloat(goal.target_weight);

            // 進捗計算
            const totalChange = Math.abs(targetWeight - startWeight);
            const currentChange = Math.abs(currentWeight - startWeight);
            
            if (totalChange > 0) {
                progress = Math.min(100, Math.round((currentChange / totalChange) * 100));
            }
        }

        res.status(200).json({
            success: true,
            goal: {
                ...goal,
                current_weight: currentWeight,
                start_weight: startWeight,
                progress
            }
        });

    } catch (error) {
        console.error('Get active goal error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// すべての目標を取得
exports.getAllGoals = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [goals] = await db.query(
            'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.status(200).json({
            success: true,
            goals
        });

    } catch (error) {
        console.error('Get all goals error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 目標を削除（無効化）
exports.deleteGoal = async (req, res) => {
    try {
        const userId = req.user.userId;
        const goalId = req.params.goalId;

        await db.query(
            'UPDATE goals SET is_active = FALSE WHERE goal_id = ? AND user_id = ?',
            [goalId, userId]
        );

        res.status(200).json({
            success: true,
            message: '目標を削除しました'
        });

    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};