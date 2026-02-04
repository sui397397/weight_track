// 言語データ
const languages = {
    ja: ja,
    en: en,
    zh: zh,
    ko: ko
};

// 現在の言語を取得
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'ja';
}

// 言語を設定
function setLanguage(lang) {
    localStorage.setItem('language', lang);
}

// テキストを翻訳
function t(key) {
    const lang = getCurrentLanguage();
    const keys = key.split('.');
    let value = languages[lang];
    
    for (const k of keys) {
        value = value?.[k];
    }
    
    return value || key;
}

// ページ内のすべての翻訳可能な要素を更新
function updatePageLanguage() {
    const lang = getCurrentLanguage();
    
    // data-i18n属性を持つ要素を更新
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // data-i18n-placeholder属性を持つ要素を更新
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // HTML lang属性を更新
    document.documentElement.lang = lang;
}