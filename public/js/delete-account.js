// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();
    
    checkAuth();
    initHamburgerMenu();
    
    // フォーム送信
    document.getElementById('deleteForm').addEventListener('submit', deleteAccount);
});

// アカウント削除
async function deleteAccount(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmDelete = document.getElementById('confirmDelete').checked;
    const errorDiv = document.getElementById('error-message');
    
    // メッセージをクリア
    errorDiv.classList.remove('show');
    
    // 確認チェック
    if (!confirmDelete) {
        errorDiv.textContent = 'チェックボックスにチェックを入れてください';
        errorDiv.classList.add('show');
        return;
    }
    
    // 最終確認
    const finalConfirm = confirm('本当にアカウントを削除しますか？この操作は取り消せません。');
    
    if (!finalConfirm) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/user/account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('アカウントを削除しました。ご利用ありがとうございました。');
            
            // localStorageをクリア
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('lastNotificationDate');
            localStorage.removeItem('language');
            
            // ログインページへ
            window.location.href = 'login.html';
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'サーバーエラーが発生しました';
        errorDiv.classList.add('show');
        console.error('Delete account error:', error);
    }
}