document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // メッセージをクリア
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    successMessage.textContent = '';
    successMessage.style.display = 'none';

    // ボタンを無効化
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    try {
        const response = await fetch('http://localhost:3000/api/password-reset/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
            successMessage.textContent = data.message;
            successMessage.style.display = 'block';
            
            // フォームをリセット
            document.getElementById('forgotPasswordForm').reset();

            // 3秒後にログインページに遷移
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
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
        submitBtn.textContent = 'リセットリンクを送信';
    }
});