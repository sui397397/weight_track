// URLからトークンを取得
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// ページ読み込み時にトークンを確認
window.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        showError('無効なリンクです');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/password-reset/verify/${token}`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('loadingMessage').style.display = 'none';
            document.getElementById('resetPasswordForm').style.display = 'block';
            document.getElementById('emailDisplay').textContent = `${data.email} のパスワードを再設定`;
        } else {
            showError(data.message || 'トークンが無効か期限切れです');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('サーバーエラーが発生しました');
    }
});

function showError(message) {
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('resetPasswordForm').style.display = 'none';
    document.getElementById('errorContainer').style.display = 'block';
    document.getElementById('tokenError').textContent = message;
}

// パスワード強度チェック
document.getElementById('newPassword').addEventListener('input', (e) => {
    const password = e.target.value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
        strengthDiv.textContent = '';
        return;
    }

    let strength = 0;
    let message = '';
    let color = '';

    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) {
        message = '弱い';
        color = '#dc3545';
    } else if (strength <= 3) {
        message = '普通';
        color = '#ffc107';
    } else {
        message = '強い';
        color = '#28a745';
    }

    strengthDiv.innerHTML = `<span style="color: ${color};">パスワード強度: ${message}</span>`;
});

// フォーム送信
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // メッセージをクリア
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    successMessage.textContent = '';
    successMessage.style.display = 'none';

    // パスワード一致確認
    if (newPassword !== confirmPassword) {
        errorMessage.textContent = 'パスワードが一致しません';
        errorMessage.style.display = 'block';
        return;
    }

    // ボタンを無効化
    submitBtn.disabled = true;
    submitBtn.textContent = '変更中...';

    try {
        const response = await fetch('http://localhost:3000/api/password-reset/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json();

        if (data.success) {
            successMessage.textContent = data.message + ' ログイン画面に移動します...';
            successMessage.style.display = 'block';
            
            // フォームをリセット
            document.getElementById('resetPasswordForm').reset();

            // 2秒後にログインページに遷移
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            errorMessage.textContent = data.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'サーバーエラーが発生しました';
        errorMessage.style.display = 'block';
    } finally {
        // ボタンを有効化
        submitBtn.disabled = false;
        submitBtn.textContent = 'パスワードを変更';
    }
});