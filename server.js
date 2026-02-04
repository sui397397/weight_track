const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// リクエストサイズ制限を増やす（画像アップロード用）
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静的ファイル（HTML, CSS, JS）の配信
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ルート
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const recordRoutes = require('./routes/recordRoutes');
app.use('/api/records', recordRoutes);

const mealRoutes = require('./routes/mealRoutes');
app.use('/api/meals', mealRoutes); 

const exerciseRoutes = require('./routes/exerciseRoutes');
app.use('/api/exercises', exerciseRoutes);

const userRoutes = require('./routes/userRoutes'); 
app.use('/api/user', userRoutes); 

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notification', notificationRoutes); 

const healthMemoRoutes = require('./routes/healthMemoRoutes');
app.use('/api/health-memo', healthMemoRoutes);

const goalRoutes = require('./routes/goalRoutes');
app.use('/api/goals', goalRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);  // ← これだけ残す

const gameRoutes = require('./routes/gameRoutes');
app.use('/api/game', gameRoutes);

const settingsRoutes = require('./routes/settingsRoutes');  
app.use('/api/settings', settingsRoutes);  

// パスワードリセット用ルート
const passwordResetRoutes = require('./routes/passwordResetRoutes');
app.use('/api/password-reset', passwordResetRoutes);

// ルートエンドポイント
app.get('/', (req, res) => {
    res.send('WeightTrack API Server is running!');
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
    console.log(`💡 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ 設定済み' : '❌ 未設定'}`);
});