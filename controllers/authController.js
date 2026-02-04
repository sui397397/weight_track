const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');

// ユーザー登録
exports.register = async (req, res) => {
    try {
        const { email, password, name, gender, birthDate } = req.body;

        // バリデーション
        if (!email || !password || !name || !gender || !birthDate) {
            return res.status(400).json({
                success: false,
                message: 'すべての項目を入力してください'
            });
        }

        // メールアドレスの重複チェック
        const [existingUsers] = await db.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'このメールアドレスは既に登録されています'
            });
        }

        // パスワードをハッシュ化
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // ユーザーを登録
        const [result] = await db.query(
            'INSERT INTO users (email, password_hash, name, gender, birth_date) VALUES (?, ?, ?, ?, ?)',
            [email, passwordHash, name, gender, birthDate]
        );

        const userId = result.insertId;

        // JWTトークンを生成
        const token = generateToken(userId, email);

        res.status(201).json({
            success: true,
            message: 'ユーザー登録が完了しました',
            token,
            user: {
                userId,
                email,
                name,
                gender,
                birthDate
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// ユーザーログイン
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // バリデーション
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'メールアドレスとパスワードを入力してください'
            });
        }

        // ユーザーを検索
        const [users] = await db.query(
            'SELECT user_id, email, password_hash, name, gender, birth_date FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'メールアドレスまたはパスワードが正しくありません'
            });
        }

        const user = users[0];

        // パスワードを検証
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'メールアドレスまたはパスワードが正しくありません'
            });
        }

        // JWTトークンを生成
        const token = generateToken(user.user_id, user.email);

        res.status(200).json({
            success: true,
            message: 'ログインに成功しました',
            token,
            user: {
                userId: user.user_id,
                email: user.email,
                name: user.name,
                gender: user.gender,
                birthDate: user.birth_date
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};