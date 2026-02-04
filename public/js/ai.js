// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage(); // 多言語対応
    
    checkAuth();
    loadConversationHistory();
    initHamburgerMenu();
    
    // チャットフォーム送信
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', sendMessage);
    }
});

// メッセージを送信
async function sendMessage(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const userInput = document.getElementById('userInput');
    const question = userInput.value.trim();
    
    if (!question) {
        return;
    }
    
    const chatMessages = document.getElementById('chatMessages');
    
    // ユーザーメッセージを表示
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.innerHTML = `<div class="message-content">${escapeHtml(question)}</div>`;
    chatMessages.appendChild(userMessageDiv);
    
    // 入力欄をクリア
    userInput.value = '';
    
    // ローディング表示
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message';
    loadingDiv.innerHTML = `<div class="message-content">考え中<span class="loader"></span></div>`;
    chatMessages.appendChild(loadingDiv);
    
    // スクロール
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // /chat エンドポイントを使用（Gemini API）
        const response = await fetch('http://localhost:3000/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: question })  // "message" に変更
        });
        
        const data = await response.json();
        
        // ローディングを削除
        chatMessages.removeChild(loadingDiv);
        
        if (data.success) {
            // AI回答を表示
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'message ai-message';
            aiMessageDiv.innerHTML = `<div class="message-content">${formatMarkdown(data.response)}</div>`;  // "response" に変更
            chatMessages.appendChild(aiMessageDiv);
            
            // スクロール
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 会話履歴を更新
            loadConversationHistory();
        } else {
            // エラーメッセージを表示
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message ai-message';
            errorDiv.innerHTML = `<div class="message-content">申し訳ございません。エラーが発生しました。<br>${escapeHtml(data.message || '')}</div>`;
            chatMessages.appendChild(errorDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } catch (error) {
        // ローディングを削除
        if (chatMessages.contains(loadingDiv)) {
            chatMessages.removeChild(loadingDiv);
        }
        
        console.error('Send message error:', error);
        
        // エラーメッセージを表示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message ai-message';
        errorDiv.innerHTML = `<div class="message-content">通信エラーが発生しました。しばらくしてから再度お試しください。</div>`;
        chatMessages.appendChild(errorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 会話履歴を読み込む
async function loadConversationHistory() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/ai/conversations', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        const historyDiv = document.getElementById('conversationHistory');
        
        if (data.success && data.conversations && data.conversations.length > 0) {
            historyDiv.innerHTML = `
                <div class="conversation-list">
                    ${data.conversations.map(conv => {
                        const date = new Date(conv.created_at);
                        const formattedDate = date.toLocaleString('ja-JP');
                        
                        return `
                            <div class="conversation-item">
                                <div class="conversation-date">${formattedDate}</div>
                                <div class="conversation-question">❓ ${escapeHtml(conv.user_message)}</div>
                                <div class="conversation-answer">${formatMarkdown(conv.ai_response)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            historyDiv.innerHTML = '<p class="no-data">まだ相談履歴がありません</p>';
        }
    } catch (error) {
        console.error('Load history error:', error);
        document.getElementById('conversationHistory').innerHTML = '<p class="no-data">履歴の読み込みに失敗しました</p>';
    }
}

// マークダウン風のテキストをフォーマット
function formatMarkdown(text) {
    // HTMLエスケープ
    text = escapeHtml(text);
    
    // 改行を保持
    text = text.replace(/\n/g, '<br>');
    
    // 太字
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 見出し
    text = text.replace(/###\s(.*?)<br>/g, '<h3>$1</h3>');
    text = text.replace(/##\s(.*?)<br>/g, '<h2>$1</h2>');
    text = text.replace(/#\s(.*?)<br>/g, '<h1>$1</h1>');
    
    // リスト
    text = text.replace(/•\s/g, '• ');
    text = text.replace(/-\s/g, '• ');
    
    return text;
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}