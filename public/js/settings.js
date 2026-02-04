// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initHamburgerMenu();
    initTabs();
    
    // 各タブの初期化
    loadPrivacySettings();
    loadNotificationSettings();
    checkNotificationPermission();
    
    // フォーム初期化
    initPrivacyForm();
    initNotificationForm();
    initPasswordForm();
    
    // 通知スケジューラーを開始
    startNotificationScheduler();
    
    // 通知関連のイベント
    const dailyReminder = document.getElementById('dailyReminder');
    if (dailyReminder) {
        dailyReminder.addEventListener('change', toggleReminderTime);
    }
    
    const requestBtn = document.getElementById('requestPermission');
    if (requestBtn) {
        requestBtn.addEventListener('click', requestNotificationPermission);
    }
    
    const testBtn = document.getElementById('testNotification');
    if (testBtn) {
        testBtn.addEventListener('click', sendTestNotification);
    }
});

// ========================================
// タブ切り替え機能
// ========================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.settings-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // すべてのタブとコンテンツから active を削除
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // クリックされたタブとコンテンツに active を追加
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// ========================================
// 一般設定（プライバシー）
// ========================================

async function loadPrivacySettings() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/settings/privacy`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const settings = data.settings;
            
            document.getElementById('nickname').value = settings.nickname || '';
            document.getElementById('showInRanking').checked = settings.show_in_ranking;
        }
    } catch (error) {
        console.error('Load privacy settings error:', error);
    }
}

function initPrivacyForm() {
    const form = document.getElementById('privacyForm');
    const messageDiv = document.getElementById('privacyMessage');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nickname = document.getElementById('nickname').value.trim();
        const showInRanking = document.getElementById('showInRanking').checked;
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/settings/privacy`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nickname: nickname,
                    show_in_ranking: showInRanking
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage(messageDiv, '設定を保存しました', 'success');
            } else {
                showMessage(messageDiv, data.message, 'error');
            }
        } catch (error) {
            console.error('Update privacy settings error:', error);
            showMessage(messageDiv, 'サーバーエラーが発生しました', 'error');
        }
    });
}

// ========================================
// 通知設定
// ========================================

async function loadNotificationSettings() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/notification/settings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.settings) {
            const settings = data.settings;
            
            document.getElementById('dailyReminder').checked = settings.daily_reminder;
            document.getElementById('reminderTime').value = settings.reminder_time.slice(0, 5);
            document.getElementById('goalAchievement').checked = settings.goal_achievement;
            document.getElementById('weeklyReport').checked = settings.weekly_report;
            
            toggleReminderTime();
        }
    } catch (error) {
        console.error('Load notification settings error:', error);
    }
}

function initNotificationForm() {
    const form = document.getElementById('notificationForm');
    const messageDiv = document.getElementById('notificationMessage');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const dailyReminder = document.getElementById('dailyReminder').checked;
        const reminderTime = document.getElementById('reminderTime').value;
        const goalAchievement = document.getElementById('goalAchievement').checked;
        const weeklyReport = document.getElementById('weeklyReport').checked;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/notification/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    dailyReminder,
                    reminderTime,
                    goalAchievement,
                    weeklyReport
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage(messageDiv, '設定を保存しました', 'success');
            } else {
                showMessage(messageDiv, data.message, 'error');
            }
        } catch (error) {
            console.error('Save notification settings error:', error);
            showMessage(messageDiv, 'サーバーエラーが発生しました', 'error');
        }
    });
}

function toggleReminderTime() {
    const dailyReminder = document.getElementById('dailyReminder').checked;
    const reminderTimeContainer = document.getElementById('reminderTimeContainer');
    
    if (dailyReminder) {
        reminderTimeContainer.style.display = 'flex';
    } else {
        reminderTimeContainer.style.display = 'none';
    }
}

function checkNotificationPermission() {
    const statusElement = document.getElementById('permissionStatus');
    const requestBtn = document.getElementById('requestPermission');
    const testBtn = document.getElementById('testNotification');
    
    if (!('Notification' in window)) {
        statusElement.textContent = 'このブラウザは通知に対応していません';
        statusElement.style.color = '#e74c3c';
        return;
    }
    
    if (Notification.permission === 'granted') {
        statusElement.textContent = '✅ 通知が許可されています';
        statusElement.style.color = '#28a745';
        testBtn.style.display = 'inline-block';
    } else if (Notification.permission === 'denied') {
        statusElement.textContent = '❌ 通知が拒否されています。ブラウザの設定から許可してください。';
        statusElement.style.color = '#e74c3c';
    } else {
        statusElement.textContent = '通知が許可されていません';
        statusElement.style.color = '#999';
        requestBtn.style.display = 'inline-block';
    }
}

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert('このブラウザは通知に対応していません');
        return;
    }
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
        alert('通知が許可されました！');
        checkNotificationPermission();
    } else {
        alert('通知が拒否されました');
        checkNotificationPermission();
    }
}

function sendTestNotification() {
    if (Notification.permission === 'granted') {
        new Notification('WeightTrack', {
            body: '通知のテストです。記録を忘れずに！',
            icon: '/favicon.ico',
            badge: '/favicon.ico'
        });
    } else {
        alert('通知が許可されていません');
    }
}

// 通知スケジューラー
function startNotificationScheduler() {
    setInterval(async () => {
        await checkAndSendNotification();
    }, 60000); // 1分ごと
    
    checkAndSendNotification(); // 初回チェック
}

async function checkAndSendNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/notification/settings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!data.success || !data.settings) return;
        
        const settings = data.settings;
        
        if (settings.daily_reminder) {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const reminderTime = settings.reminder_time.slice(0, 5);
            
            if (currentTime === reminderTime) {
                const lastNotificationDate = localStorage.getItem('lastNotificationDate');
                const today = now.toISOString().split('T')[0];
                
                if (lastNotificationDate !== today) {
                    const hasRecord = await checkTodayRecord(token);
                    
                    if (!hasRecord) {
                        new Notification('WeightTrack - 記録のリマインダー', {
                            body: '今日の体重を記録しましょう！',
                            icon: '/favicon.ico',
                            badge: '/favicon.ico',
                            tag: 'daily-reminder',
                            requireInteraction: false
                        });
                        
                        localStorage.setItem('lastNotificationDate', today);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Notification scheduler error:', error);
    }
}

async function checkTodayRecord(token) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${API_BASE_URL}/api/records/date/${today}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        return data.success && data.record;
        
    } catch (error) {
        console.error('Check today record error:', error);
        return false;
    }
}

// ========================================
// アカウント設定（パスワード変更）
// ========================================

function initPasswordForm() {
    const form = document.getElementById('passwordForm');
    const messageDiv = document.getElementById('passwordMessage');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const token = localStorage.getItem('token');
        
        if (newPassword !== confirmPassword) {
            showMessage(messageDiv, '新しいパスワードが一致しません', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage(messageDiv, 'パスワードを変更しました', 'success');
                form.reset();
            } else {
                showMessage(messageDiv, data.message, 'error');
            }
        } catch (error) {
            console.error('Change password error:', error);
            showMessage(messageDiv, 'サーバーエラーが発生しました', 'error');
        }
    });
}

// ========================================
// ユーティリティ関数
// ========================================

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}