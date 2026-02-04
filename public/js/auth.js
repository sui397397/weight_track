// ログインフォーム
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // トークンとユーザー名を保存
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('userName', data.user.name); // 追加
                
                alert('ログインに成功しました！');
                window.location.href = 'home.html';
            } else {
                errorDiv.textContent = data.message;
                errorDiv.classList.add('show');
            }
        } catch (error) {
            errorDiv.textContent = 'サーバーエラーが発生しました';
            errorDiv.classList.add('show');
            console.error('Login error:', error);
        }
    });
}

// 登録フォーム
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const gender = document.getElementById('gender').value;
        const birthDate = document.getElementById('birthDate').value;
        const errorDiv = document.getElementById('error-message');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password, 
                    gender, 
                    birthDate 
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // トークンとユーザー名を保存
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('userName', data.user.name); // 追加
                
                alert('登録が完了しました！');
                window.location.href = 'home.html';
            } else {
                errorDiv.textContent = data.message;
                errorDiv.classList.add('show');
            }
        } catch (error) {
            errorDiv.textContent = 'サーバーエラーが発生しました';
            errorDiv.classList.add('show');
            console.error('Register error:', error);
        }
    });
}