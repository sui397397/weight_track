const db = require('../config/database');

// AIアドバイスを取得（ルールベース）
exports.getAdvice = async (req, res) => {
    try {
        const userId = req.user.userId;

        // ユーザー情報を取得
        const [users] = await db.query(
            'SELECT name, gender, birth_date FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }

        const user = users[0];

        // 最近の体重記録を取得（最新10件）
        const [records] = await db.query(
            'SELECT weight, body_fat_percentage, record_date, memo FROM weight_records WHERE user_id = ? ORDER BY record_date DESC LIMIT 10',
            [userId]
        );

        if (records.length === 0) {
            return res.status(400).json({
                success: false,
                message: '体重記録がありません。まず記録を入力してください。'
            });
        }

        // アクティブな目標を取得
        const [goals] = await db.query(
            'SELECT target_weight, start_date, end_date FROM goals WHERE user_id = ? AND is_active = TRUE',
            [userId]
        );

        // 年齢を計算
        const birthDate = new Date(user.birth_date);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        // アドバイスを生成
        const advice = generateAdvice(user, records, goals.length > 0 ? goals[0] : null, age);

        // 会話履歴を保存
        await db.query(
            'INSERT INTO ai_conversations (user_id, user_message, ai_response) VALUES (?, ?, ?)',
            [userId, 'アドバイスをください', advice]
        );

        res.status(200).json({
            success: true,
            advice
        });

    } catch (error) {
        console.error('AI Advice error:', error);
        res.status(500).json({
            success: false,
            message: 'アドバイスの生成に失敗しました'
        });
    }
};

// カスタム質問に回答（ルールベース）
exports.askQuestion = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: '質問を入力してください'
            });
        }

        // ユーザー情報と記録を取得
        const [users] = await db.query(
            'SELECT name, gender, birth_date FROM users WHERE user_id = ?',
            [userId]
        );

        const [records] = await db.query(
            'SELECT weight, body_fat_percentage, record_date FROM weight_records WHERE user_id = ? ORDER BY record_date DESC LIMIT 5',
            [userId]
        );

        const user = users[0];
        const age = new Date().getFullYear() - new Date(user.birth_date).getFullYear();

        // 質問に対する回答を生成
        const answer = generateAnswer(question, user, records, age);

        // 会話履歴を保存
        await db.query(
            'INSERT INTO ai_conversations (user_id, user_message, ai_response) VALUES (?, ?, ?)',
            [userId, question, answer]
        );

        res.status(200).json({
            success: true,
            answer
        });

    } catch (error) {
        console.error('AI Question error:', error);
        res.status(500).json({
            success: false,
            message: '回答の生成に失敗しました'
        });
    }
};

// チャット応答（OpenAI API使用）
exports.chat = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'メッセージを入力してください'
            });
        }

        // .envファイルからAPIキーを取得
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            console.error('❌ OPENAI_API_KEY が .env ファイルに設定されていません');
            return res.status(500).json({ 
                success: false, 
                message: 'OpenAI APIキーが設定されていません' 
            });
        }
        
        console.log(`📤 OpenAI APIにリクエスト送信中... (User ID: ${userId})`);
        
        // OpenAI APIにリクエスト
        const openaiResponse = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `あなたは体重管理アプリ「WeightTrack」の健康アドバイザーです。
ユーザーの体重管理、食事、運動に関する相談に、親切で分かりやすく答えてください。
専門的すぎず、励ましと具体的なアドバイスを含めてください。
回答は日本語で、簡潔に（200文字程度）まとめてください。`
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            }
        );
        
        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            console.error('❌ OpenAI API Error:', errorData);
            return res.status(openaiResponse.status).json({ 
                success: false, 
                message: 'OpenAI APIエラー',
                error: errorData
            });
        }
        
        const data = await openaiResponse.json();
        console.log('✅ OpenAI APIから応答を受信');
        
        // レスポンスからテキストを抽出
        const aiResponse = data.choices[0].message.content;
        
        if (!aiResponse) {
            console.error('❌ AIからの応答が空です');
            return res.status(500).json({ 
                success: false, 
                message: 'AIからの応答が取得できませんでした' 
            });
        }

        // 会話履歴を保存
        try {
            await db.query(
                'INSERT INTO ai_conversations (user_id, user_message, ai_response) VALUES (?, ?, ?)',
                [userId, message, aiResponse]
            );
            console.log('💾 会話をデータベースに保存しました');
        } catch (dbError) {
            console.error('⚠️ データベース保存エラー:', dbError);
            // データベースエラーでもAIの応答は返す
        }

        res.json({
            success: true,
            response: aiResponse
        });

    } catch (error) {
        console.error('❌ AI Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました',
            error: error.message
        });
    }
};

// 会話履歴を取得
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [conversations] = await db.query(
            'SELECT * FROM ai_conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [userId]
        );

        res.status(200).json({
            success: true,
            conversations
        });

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 食事画像を解析してカロリー・栄養素を推定（AI機能は準備中）
exports.analyzeFoodImage = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { imageBase64 } = req.body;
        
        if (!imageBase64) {
            return res.status(400).json({
                success: false,
                message: '画像データが必要です'
            });
        }

        // .envファイルからAPIキーを取得
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            console.error('❌ OPENAI_API_KEY が .env ファイルに設定されていません');
            return res.status(500).json({ 
                success: false, 
                message: 'OpenAI APIキーが設定されていません' 
            });
        }
        
        console.log(`📤 OpenAI Vision API (gpt-4o) にリクエスト送信中... (User ID: ${userId})`);
        
        // OpenAI Vision APIにリクエスト
        const openaiResponse = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',  // 画像認識にはgpt-4oが必要
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: `この食事の写真を分析して、以下の情報をJSON形式で返してください。推定値で構いません。

{
  "dish_name": "料理名（日本語）",
  "calories": カロリー（kcal、数値のみ）,
  "protein": たんぱく質（g、数値のみ）,
  "fat": 脂質（g、数値のみ）,
  "carbs": 炭水化物（g、数値のみ）,
  "description": "簡単な説明（50文字以内）"
}

必ずJSONのみを返し、他のテキストは含めないでください。`
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: imageBase64
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 500
                })
            }
        );
        
        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            console.error('❌ OpenAI Vision API Error:', errorData);
            return res.status(openaiResponse.status).json({ 
                success: false, 
                message: 'OpenAI Vision APIエラー',
                error: errorData
            });
        }
        
        const data = await openaiResponse.json();
        console.log('✅ OpenAI Vision APIから応答を受信');
        
        // レスポンスからテキストを抽出
        let aiResponse = data.choices[0].message.content;
        
        if (!aiResponse) {
            console.error('❌ AIからの応答が空です');
            return res.status(500).json({ 
                success: false, 
                message: 'AIからの応答が取得できませんでした' 
            });
        }

        // JSONをパース
        try {
            // ```json と ``` を削除（もしあれば）
            aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```/g, '').trim();
            const analysis = JSON.parse(aiResponse);
            
            console.log('🍽️ 食事分析結果:', analysis);
            
            res.json({
                success: true,
                analysis: {
                    dish_name: analysis.dish_name || '不明',
                    calories: analysis.calories || 0,
                    protein: analysis.protein || 0,
                    fat: analysis.fat || 0,
                    carbs: analysis.carbs || 0,
                    description: analysis.description || ''
                }
            });
            
        } catch (parseError) {
            console.error('❌ JSON解析エラー:', parseError);
            console.error('受信したレスポンス:', aiResponse);
            return res.status(500).json({
                success: false,
                message: 'AIの応答を解析できませんでした'
            });
        }

    } catch (error) {
        console.error('❌ Food Image Analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました',
            error: error.message
        });
    }
};

// アドバイス生成関数（ルールベース）
function generateAdvice(user, records, goal, age) {
    let advice = `こんにちは、${user.name}さん！あなたの体重データを分析して、パーソナライズされたアドバイスをお届けします。\n\n`;
    // ... (省略：既存のコードと同じ)
    return advice;
}

// 質問に対する回答生成（ルールベース）
function generateAnswer(question, user, records, age) {
    return `ご質問ありがとうございます！体重管理に関することなら、何でも聞いてくださいね。`;
}

module.exports = exports;