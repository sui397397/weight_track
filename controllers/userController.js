const db = require('../config/database');
const bcrypt = require('bcrypt');

// プロフィール情報を取得
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [users] = await db.query(
            'SELECT user_id, email, name, gender, birth_date, created_at FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }

        res.status(200).json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// プロフィール情報を更新
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, gender, birthDate } = req.body;

        // バリデーション
        if (!name || !gender || !birthDate) {
            return res.status(400).json({
                success: false,
                message: 'すべての項目を入力してください'
            });
        }

        await db.query(
            'UPDATE users SET name = ?, gender = ?, birth_date = ? WHERE user_id = ?',
            [name, gender, birthDate, userId]
        );

        // 更新後のユーザー情報を取得
        const [users] = await db.query(
            'SELECT user_id, email, name, gender, birth_date FROM users WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'プロフィールを更新しました',
            user: users[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// パスワードを変更
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        // バリデーション
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '現在のパスワードと新しいパスワードを入力してください'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: '新しいパスワードは6文字以上にしてください'
            });
        }

        // 現在のパスワードを確認
        const [users] = await db.query(
            'SELECT password_hash FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }

        const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: '現在のパスワードが正しくありません'
            });
        }

        // 新しいパスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // パスワードを更新
        await db.query(
            'UPDATE users SET password_hash = ? WHERE user_id = ?',
            [hashedPassword, userId]
        );

        res.status(200).json({
            success: true,
            message: 'パスワードを変更しました'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// アカウントを削除
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;

        // パスワード確認
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'パスワードを入力してください'
            });
        }

        // 現在のパスワードを確認
        const [users] = await db.query(
            'SELECT password_hash FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }

        const isValid = await bcrypt.compare(password, users[0].password_hash);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'パスワードが正しくありません'
            });
        }

        // ユーザーを削除（外部キー制約により関連データも自動削除）
        await db.query('DELETE FROM users WHERE user_id = ?', [userId]);

        res.status(200).json({
            success: true,
            message: 'アカウントを削除しました'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};