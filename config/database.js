const mysql = require('mysql2');
require('dotenv').config();

// データベース接続プールを作成
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Promiseベースのインターフェースを使用
const promisePool = pool.promise();

// 接続テスト
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ データベース接続エラー:', err.message);
        return;
    }
    console.log('✅ MySQLデータベースに接続しました');
    connection.release();
});

module.exports = promisePool;