const db = require('../config/database');

// 運動記録を保存
exports.createExerciseRecord = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { exerciseType, exerciseName, duration, distance, memo, exerciseDate, exerciseTime } = req.body;

        // 数値フィールドは空文字列をnullに変換
        const caloriesBurned = req.body.caloriesBurned || null;
        const distanceValue = distance || null;

        // バリデーション
        if (!exerciseType || !exerciseName || !duration || !exerciseDate) {
            return res.status(400).json({
                success: false,
                message: '運動タイプ、運動名、時間、日付は必須です'
            });
        }

        await db.query(
            'INSERT INTO exercise_records (user_id, exercise_type, exercise_name, duration, calories_burned, distance, memo, exercise_date, exercise_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, exerciseType, exerciseName, duration, caloriesBurned, distanceValue, memo, exerciseDate, exerciseTime]
        );

        // アバター育成ポイントを加算
        try {
            const gameController = require('./gameController');
            await gameController.addPoints({
                user: req.user,
                body: { points: 5, source: 'exercise' }
            }, {
                json: () => {}
            });
        } catch (error) {
            console.error('Game points error:', error);
        }

        res.status(201).json({
            success: true,
            message: '運動記録を保存しました'
        });

    } catch (error) {
        console.error('Create exercise record error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 今日の運動記録を取得
exports.getTodayExercises = async (req, res) => {
    try {
        const userId = req.user.userId;
        const today = new Date().toISOString().split('T')[0];

        const [exercises] = await db.query(
            'SELECT * FROM exercise_records WHERE user_id = ? AND exercise_date = ? ORDER BY exercise_time ASC',
            [userId, today]
        );

        res.status(200).json({
            success: true,
            exercises
        });

    } catch (error) {
        console.error('Get today exercises error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 特定の日付の運動記録を取得
exports.getExercisesByDate = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date } = req.params;

        const [exercises] = await db.query(
            'SELECT * FROM exercise_records WHERE user_id = ? AND exercise_date = ? ORDER BY exercise_time ASC',
            [userId, date]
        );

        res.status(200).json({
            success: true,
            exercises
        });

    } catch (error) {
        console.error('Get exercises by date error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 最近の運動記録を取得
exports.getRecentExercises = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [exercises] = await db.query(
            'SELECT * FROM exercise_records WHERE user_id = ? ORDER BY exercise_date DESC, exercise_time DESC LIMIT 20',
            [userId]
        );

        res.status(200).json({
            success: true,
            exercises
        });

    } catch (error) {
        console.error('Get recent exercises error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 運動記録を削除
exports.deleteExerciseRecord = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { exerciseId } = req.params;

        await db.query(
            'DELETE FROM exercise_records WHERE exercise_id = ? AND user_id = ?',
            [exerciseId, userId]
        );

        res.status(200).json({
            success: true,
            message: '運動記録を削除しました'
        });

    } catch (error) {
        console.error('Delete exercise record error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};