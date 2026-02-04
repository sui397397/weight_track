const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// メール送信設定（すべてのメールサービスに対応）
const createTransporter = () => {
    // 環境変数に応じて設定を変更
    const emailService = process.env.EMAIL_SERVICE; // 'gmail', 'outlook', 'yahoo', 'custom'
    
    if (emailService === 'custom' || process.env.EMAIL_HOST) {
        // カスタムSMTPサーバー
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else if (emailService === 'gmail') {
        // Gmailは明示的にポート587を指定（ファイアウォール対策）
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // TLS使用
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else if (emailService) {
        // Gmail, Outlook, Yahoo等の既知のサービス
        return nodemailer.createTransport({
            service: emailService,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // デフォルト（Gmail、ポート587）
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
};

const transporter = createTransporter();

// パスワードリセットリクエスト
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'メールアドレスを入力してください'
            });
        }

        // ユーザーが存在するか確認
        const [users] = await db.query(
            'SELECT user_id, name FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            // セキュリティ上、ユーザーが存在しない場合も同じメッセージを返す
            return res.status(200).json({
                success: true,
                message: 'メールアドレスが登録されている場合、リセット用のリンクを送信しました'
            });
        }

        const user = users[0];

        // ランダムなトークンを生成
        const token = crypto.randomBytes(32).toString('hex');

        // トークンの有効期限（1時間後）
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // 既存の未使用トークンを無効化
        await db.query(
            'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ? AND used = FALSE',
            [user.user_id]
        );

        // 新しいトークンを保存
        await db.query(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.user_id, token, expiresAt]
        );

        // リセット用URL（フロントエンドのURL）
        const resetUrl = `http://localhost:3000/reset-password.html?token=${token}`;

        // メール送信
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'パスワード再設定 - WeightTrack',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4aa3d8;">パスワード再設定</h2>
                    <p>こんにちは、${user.name}さん</p>
                    <p>パスワード再設定のリクエストを受け付けました。</p>
                    <p>以下のリンクをクリックして、新しいパスワードを設定してください：</p>
                    <div style="margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: linear-gradient(135deg, #4aa3d8 0%, #7dd3fc 100%);
                                  color: white;
                                  padding: 12px 30px;
                                  text-decoration: none;
                                  border-radius: 8px;
                                  display: inline-block;">
                            パスワードを再設定
                        </a>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        このリンクは1時間有効です。
                    </p>
                    <p style="color: #999; font-size: 14px;">
                        ※このメールに心当たりがない場合は、無視してください。
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px;">
                        WeightTrack - 体重管理アプリ
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'メールアドレスが登録されている場合、リセット用のリンクを送信しました'
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// トークンの有効性を確認
exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'トークンが指定されていません'
            });
        }

        // トークンを検索
        const [tokens] = await db.query(
            `SELECT t.*, u.email 
             FROM password_reset_tokens t
             JOIN users u ON t.user_id = u.user_id
             WHERE t.token = ? AND t.used = FALSE AND t.expires_at > NOW()`,
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'トークンが無効か期限切れです'
            });
        }

        res.status(200).json({
            success: true,
            email: tokens[0].email
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// パスワードをリセット
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'トークンと新しいパスワードを入力してください'
            });
        }

        // パスワードの強度チェック
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'パスワードは6文字以上で設定してください'
            });
        }

        // トークンを検索
        const [tokens] = await db.query(
            `SELECT * FROM password_reset_tokens 
             WHERE token = ? AND used = FALSE AND expires_at > NOW()`,
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'トークンが無効か期限切れです'
            });
        }

        const resetToken = tokens[0];

        // パスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // パスワードを更新
        await db.query(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashedPassword, resetToken.user_id]
        );

        // トークンを使用済みにする
        await db.query(
            'UPDATE password_reset_tokens SET used = TRUE WHERE token_id = ?',
            [resetToken.token_id]
        );

        res.status(200).json({
            success: true,
            message: 'パスワードが正常にリセットされました'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};