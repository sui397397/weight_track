// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage(); 
    
    checkAuth();
    loadProfile();
    initHamburgerMenu();
    
    // フォーム送信
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
});

// プロフィール情報を読み込む
async function loadProfile() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {
            const user = data.user;
            
            // フォームに値を設定
            document.getElementById('email').value = user.email;
            document.getElementById('name').value = user.name;
            document.getElementById('gender').value = user.gender;
            document.getElementById('birthDate').value = user.birth_date;
            
            // 登録日を表示
            const createdDate = new Date(user.created_at);
            document.getElementById('createdAt').value = createdDate.toLocaleDateString('ja-JP');
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// プロフィールを更新
async function updateProfile(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const name = document.getElementById('name').value;
    const gender = document.getElementById('gender').value;
    const birthDate = document.getElementById('birthDate').value;
    
    const errorDiv = document.getElementById('profile-error');
    const successDiv = document.getElementById('profile-success');
    
    // メッセージをクリア
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    try {
        const response = await fetch('http://localhost:3000/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                gender,
                birthDate
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            successDiv.textContent = data.message;
            successDiv.classList.add('show');
            
            // localStorageのユーザー名を更新
            localStorage.setItem('userName', name);
            
            // 3秒後にメッセージを消す
            setTimeout(() => {
                successDiv.classList.remove('show');
            }, 3000);
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'サーバーエラーが発生しました';
        errorDiv.classList.add('show');
        console.error('Update profile error:', error);
    }
}