// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();
    initHamburgerMenu();
});

// FAQの開閉
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // すべてのFAQを閉じる
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // クリックされたFAQが閉じていた場合は開く
    if (!isActive) {
        faqItem.classList.add('active');
    }
}