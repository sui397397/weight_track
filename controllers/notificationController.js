const db = require('../config/database');

// 通知設定を取得
exports.getSettings = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [settings] = await db.query(
            'SELECT * FROM notification_settings WHERE user_id = ?',
            [userId]
        );

        // 設定がない場合はデフォルト値を作成
        if (settings.length === 0) {
            await db.query(
                'INSERT INTO notification_settings (user_id) VALUES (?)',
                [userId]
            );

            const [newSettings] = await db.query(
                'SELECT * FROM notification_settings WHERE user_id = ?',
                [userId]
            );

            return res.status(200).json({
                success: true,
                settings: newSettings[0]
            });
        }

        res.status(200).json({
            success: true,
            settings: settings[0]
        });

    } catch (error) {
        console.error('Get notification settings error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 通知設定を更新
exports.updateSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { dailyReminder, reminderTime, goalAchievement, weeklyReport } = req.body;

        // 設定が存在するか確認
        const [existing] = await db.query(
            'SELECT setting_id FROM notification_settings WHERE user_id = ?',
            [userId]
        );

        if (existing.length === 0) {
            // 設定がない場合は作成
            await db.query(
                'INSERT INTO notification_settings (user_id, daily_reminder, reminder_time, goal_achievement, weekly_report) VALUES (?, ?, ?, ?, ?)',
                [userId, dailyReminder, reminderTime, goalAchievement, weeklyReport]
            );
        } else {
            // 既存の設定を更新
            await db.query(
                'UPDATE notification_settings SET daily_reminder = ?, reminder_time = ?, goal_achievement = ?, weekly_report = ? WHERE user_id = ?',
                [dailyReminder, reminderTime, goalAchievement, weeklyReport, userId]
            );
        }

        // 更新後の設定を取得
        const [settings] = await db.query(
            'SELECT * FROM notification_settings WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            message: '通知設定を更新しました',
            settings: settings[0]
        });

    } catch (error) {
        console.error('Update notification settings error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};