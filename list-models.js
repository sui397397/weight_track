require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log('利用可能なモデルを確認中...\n');
        
        // 試すモデルのリスト
        const modelsToTry = [
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-1.0-pro'
        ];
        
        for (const modelName of modelsToTry) {
            try {
                console.log(`${modelName} をテスト中...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("こんにちは");
                const response = await result.response;
                const text = response.text();
                console.log(`✅ ${modelName} は利用可能です！`);
                console.log(`   レスポンス: ${text.substring(0, 50)}...\n`);
            } catch (error) {
                console.log(`❌ ${modelName} は利用できません`);
                console.log(`   理由: ${error.message}\n`);
            }
        }
        
    } catch (error) {
        console.error('エラー:', error);
    }
}

listModels();