const db = require('../config/database');

// プライバシー設定を取得
exports.getPrivacySettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const [users] = await db.query(
            'SELECT nickname, show_in_ranking FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }
        
        res.json({
            success: true,
            settings: users[0]
        });
    } catch (error) {
        console.error('Get privacy settings error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// プライバシー設定を更新
exports.updatePrivacySettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { nickname, show_in_ranking } = req.body;
        
        // ニックネームのバリデーション
        if (nickname && nickname.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'ニックネームは50文字以内で入力してください'
            });
        }
        
        await db.query(
            'UPDATE users SET nickname = ?, show_in_ranking = ? WHERE user_id = ?',
            [nickname || null, show_in_ranking, userId]
        );
        
        res.json({
            success: true,
            message: '設定を更新しました'
        });
    } catch (error) {
        console.error('Update privacy settings error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

module.exports = exports;