// APIのベースURLを取得（開発環境とngrok環境で切り替え）
function getApiBaseUrl() {
    // ngrok経由でアクセスしている場合
    if (window.location.hostname.includes('ngrok')) {
        return window.location.origin; // https://xxx.ngrok-free.dev
    }
    // ローカル開発の場合
    return 'http://localhost:3000';
}

const API_BASE_URL = getApiBaseUrl();

// 認証チェック
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// ハンバーガーメニュー初期化
function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const hamburgerClose = document.getElementById('hamburgerClose');
    const hamburgerOverlay = document.getElementById('hamburgerOverlay');
    const hamburgerLogout = document.getElementById('hamburgerLogout');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerMenu.classList.add('active');
        });
    }

    if (hamburgerClose) {
        hamburgerClose.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
        });
    }

    if (hamburgerOverlay) {
        hamburgerOverlay.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
        });
    }
    
    if (hamburgerLogout) {
        hamburgerLogout.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// ログアウト
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

// 現在の日付表示
function displayCurrentDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = today.toLocaleDateString('ja-JP', options);
    }
}

// Service Worker の登録（PWA対応）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker 登録成功:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker 登録失敗:', error);
            });
    });
}