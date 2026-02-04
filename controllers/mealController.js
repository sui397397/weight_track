const db = require('../config/database');

// 食事記録を保存
exports.createMealRecord = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { mealType, mealName, memo, mealDate, mealTime } = req.body;

        // 数値フィールドは空文字列をnullに変換
        const calories = req.body.calories || null;
        const protein = req.body.protein || null;
        const carbs = req.body.carbs || null;
        const fat = req.body.fat || null;

        const imagePath = req.file ? req.file.filename : null;

        // バリデーション
        if (!mealType || !mealName || !mealDate) {
            return res.status(400).json({
                success: false,
                message: '食事タイプ、食事名、日付は必須です'
            });
        }

        await db.query(
            'INSERT INTO meal_records (user_id, meal_type, meal_name, calories, protein, carbs, fat, memo, image_path, meal_date, meal_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, mealType, mealName, calories, protein, carbs, fat, memo, imagePath, mealDate, mealTime]
        );

        // アバター育成ポイントを加算
        try {
            const gameController = require('./gameController');
            await gameController.addPoints({
                user: req.user,
                body: { points: 5, source: 'meal' }
            }, {
                json: () => {}
            });
        } catch (error) {
            console.error('Game points error:', error);
        }

        res.status(201).json({
            success: true,
            message: '食事記録を保存しました'
        });

    } catch (error) {
        console.error('Create meal record error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 今日の食事記録を取得
exports.getTodayMeals = async (req, res) => {
    try {
        const userId = req.user.userId;
        const today = new Date().toISOString().split('T')[0];

        const [meals] = await db.query(
            'SELECT * FROM meal_records WHERE user_id = ? AND meal_date = ? ORDER BY meal_time ASC',
            [userId, today]
        );

        res.status(200).json({
            success: true,
            meals
        });

    } catch (error) {
        console.error('Get today meals error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 特定の日付の食事記録を取得
exports.getMealsByDate = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date } = req.params;

        const [meals] = await db.query(
            'SELECT * FROM meal_records WHERE user_id = ? AND meal_date = ? ORDER BY meal_time ASC',
            [userId, date]
        );

        res.status(200).json({
            success: true,
            meals
        });

    } catch (error) {
        console.error('Get meals by date error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 最近の食事記録を取得
exports.getRecentMeals = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [meals] = await db.query(
            'SELECT * FROM meal_records WHERE user_id = ? ORDER BY meal_date DESC, meal_time DESC LIMIT 20',
            [userId]
        );

        res.status(200).json({
            success: true,
            meals
        });

    } catch (error) {
        console.error('Get recent meals error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 食事記録を削除
exports.deleteMealRecord = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { mealId } = req.params;

        await db.query(
            'DELETE FROM meal_records WHERE meal_id = ? AND user_id = ?',
            [mealId, userId]
        );

        res.status(200).json({
            success: true,
            message: '食事記録を削除しました'
        });

    } catch (error) {
        console.error('Delete meal record error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};