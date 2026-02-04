// 利用可能なGeminiモデルを確認するスクリプト
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log('🔍 利用可能なGeminiモデルを確認中...\n');
        
        // APIキーの確認
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY が設定されていません');
            return;
        }
        
        console.log('✅ APIキー:', process.env.GEMINI_API_KEY.substring(0, 10) + '...\n');
        
        // モデル一覧を取得
        const models = await genAI.listModels();
        
        console.log('📋 利用可能なモデル一覧:\n');
        console.log('='.repeat(80));
        
        for (const model of models) {
            console.log(`\n🤖 モデル名: ${model.name}`);
            console.log(`   表示名: ${model.displayName}`);
            console.log(`   説明: ${model.description || 'なし'}`);
            
            if (model.supportedGenerationMethods) {
                console.log(`   対応メソッド: ${model.supportedGenerationMethods.join(', ')}`);
            }
            
            // 画像対応の確認
            if (model.name.includes('vision') || 
                model.name.includes('pro') || 
                model.name.includes('1.5')) {
                console.log('   📸 画像解析: 対応している可能性が高い');
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('\n✅ 確認完了！');
        
    } catch (error) {
        console.error('❌ エラーが発生しました:', error.message);
        console.error('詳細:', error);
    }
}

listModels();