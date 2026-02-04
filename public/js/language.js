// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();
    
    initHamburgerMenu();
    updateCurrentLanguage();
    highlightSelectedLanguage();
});

// 現在の言語を表示
function updateCurrentLanguage() {
    const currentLang = localStorage.getItem('language') || 'ja';
    const langNames = {
        ja: '日本語',
        en: 'English',
        zh: '中文',
        ko: '한국어'
    };
    
    document.getElementById('currentLang').textContent = langNames[currentLang];
}

// 選択中の言語をハイライト
function highlightSelectedLanguage() {
    const currentLang = localStorage.getItem('language') || 'ja';
    
    document.querySelectorAll('.lang-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.lang === currentLang) {
            option.classList.add('active');
        }
    });
}

// 言語を変更
function changeLanguage(lang) {
    // localStorageに保存
    localStorage.setItem('language', lang);
    
    // 成功メッセージを表示
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = '言語を変更しました。ページをリロードしてください。';
    successDiv.classList.add('show');
    
    // 選択状態を更新
    highlightSelectedLanguage();
    updateCurrentLanguage();
    
    // 3秒後にメッセージを消す
    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 3000);
}