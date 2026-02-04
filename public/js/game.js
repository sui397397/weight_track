// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initHamburgerMenu();
    checkLoginBonus();
    loadGameData();
    initRankingTabs();
});

// ランキングタブを初期化
function initRankingTabs() {
    const weeklyTab = document.getElementById('weeklyTab');
    const monthlyTab = document.getElementById('monthlyTab');
    
    weeklyTab.addEventListener('click', () => {
        weeklyTab.classList.add('active');
        monthlyTab.classList.remove('active');
        loadWeeklyRanking();
        document.getElementById('rankingDescription').textContent = '今週のポイント獲得ランキング';
    });
    
    monthlyTab.addEventListener('click', () => {
        monthlyTab.classList.add('active');
        weeklyTab.classList.remove('active');
        loadMonthlyRanking();
        document.getElementById('rankingDescription').textContent = '今月のポイント獲得ランキング';
    });
}

// ログインボーナスをチェック
async function checkLoginBonus() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/game/login-bonus`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && !data.already_received) {
            // ログインボーナス獲得アニメーション
            showLoginBonusNotification(data.bonus_points);
        }
    } catch (error) {
        console.error('Login bonus error:', error);
    }
}

// ログインボーナス通知を表示
function showLoginBonusNotification(points) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
        color: white;
        padding: 30px 50px;
        border-radius: 20px;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: bonusPopup 0.5s ease-out;
    `;
    notification.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px;">🎁</div>
        <div>ログインボーナス</div>
        <div style="font-size: 36px; margin-top: 10px;">+${points}pt</div>
    `;
    
    document.body.appendChild(notification);
    
    // 3秒後に消す
    setTimeout(() => {
        notification.style.animation = 'bonusFadeOut 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// CSSアニメーションを追加
const style = document.createElement('style');
style.textContent = `
    @keyframes bonusPopup {
        0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    @keyframes bonusFadeOut {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
    }
`;
document.head.appendChild(style);

// アバター育成データを読み込み
async function loadGameData() {
    await loadProgress();
    await loadBadges();
    await loadWeeklyRanking();
}

// プレイヤーの進捗を読み込み
async function loadProgress() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/game/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const progress = data.progress;
            
            // プレイヤー名
            document.getElementById('playerName').textContent = userName || 'プレイヤー';
            
            // レベル
            document.getElementById('playerLevel').textContent = progress.level;
            
            // ポイント
            document.getElementById('totalPoints').textContent = progress.total_points.toLocaleString();
            
            // 経験値（修正）
            const currentXP = progress.current_xp || 0;
            const requiredExp = progress.xp_to_next_level || (progress.level * 100);
            const expPercentage = (currentXP / requiredExp) * 100;
            document.getElementById('currentExp').textContent = currentXP;
            document.getElementById('requiredExp').textContent = requiredExp;
            document.getElementById('expFill').style.width = `${expPercentage}%`;
            
            // 連続記録
            document.getElementById('currentStreak').textContent = progress.current_streak;
            document.getElementById('longestStreak').textContent = progress.longest_streak;
            
            // アバター
            updateAvatar(progress.level);
        }
    } catch (error) {
        console.error('Load progress error:', error);
    }
}

// バッジを読み込み
async function loadBadges() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/game/badges`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // バッジカウント
            document.getElementById('badgeCount').textContent = data.earned_count;
            document.getElementById('badgeTotal').textContent = data.total_count;
            
            // バッジグリッド
            const badgeGrid = document.getElementById('badgeGrid');
            badgeGrid.innerHTML = '';
            
            data.badges.forEach(badge => {
                const badgeElement = createBadgeElement(badge);
                badgeGrid.appendChild(badgeElement);
            });
        }
    } catch (error) {
        console.error('Load badges error:', error);
    }
}

// バッジ要素を作成（🔧 修正版）
function createBadgeElement(badge) {
    const div = document.createElement('div');
    
    // 🔧 earned判定を修正（1 = 獲得済み, 0 = 未獲得）
    const isEarned = badge.earned === 1 || badge.earned === true;
    div.className = `badge-item ${isEarned ? 'earned' : 'locked'}`;
    
    // アイコンの決定: 画像 > 絵文字 > デフォルト
    let iconHtml;
    if (badge.icon_image) {
        // 画像がある場合
        iconHtml = `<img src="${badge.icon_image}" class="badge-icon-image" alt="${badge.badge_name}">`;
    } else if (badge.icon_emoji) {
        // 絵文字がある場合
        iconHtml = `<span class="badge-icon">${badge.icon_emoji}</span>`;
    } else {
        // デフォルト絵文字
        iconHtml = `<span class="badge-icon">🏅</span>`;
    }
    
    let content = `
        ${iconHtml}
        <div class="badge-name">${badge.badge_name}</div>
        <div class="badge-description">${badge.description}</div>
    `;
    
    if (isEarned) {
        const earnedDate = new Date(badge.earned_at);
        content += `<div class="badge-earned-date">獲得: ${earnedDate.getMonth() + 1}/${earnedDate.getDate()}</div>`;
    } else {
        content += `<div class="badge-condition">${getConditionText(badge)}</div>`;
    }
    
    div.innerHTML = content;
    
    return div;
}

// 条件テキストを取得（🔧 特別バッジ対応版）
function getConditionText(badge) {
    switch (badge.condition_type) {
        case 'streak':
            return `${badge.condition_value}日連続で達成`;
        case 'total_days':
            return `累計${badge.condition_value}日記録`;
        case 'weight_loss':
            return `${badge.condition_value}kg減量`;
        case 'meal_count':
            return `食事記録${badge.condition_value}回`;
        case 'exercise_count':
            return `運動記録${badge.condition_value}回`;
        case 'first_record':
            return '初めて記録する';
        case 'perfect_week':
            return '1週間毎日記録する';
        case 'night_owl':
            return '夜間(21:00-6:00)に30回記録';
        case 'early_bird':
            return '朝(6:00-9:00)に30回記録';
        default:
            return '条件を達成';
    }
}

// 週間ランキングを読み込み
async function loadWeeklyRanking() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/game/ranking/weekly`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 自分の順位を表示
            displayMyRank(data.my_rank);
            
            // ランキングを表示
            displayRanking(data.ranking);
        }
    } catch (error) {
        console.error('Load ranking error:', error);
    }
}

// 月間ランキングを読み込み
async function loadMonthlyRanking() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/game/ranking/monthly`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 自分の順位を表示
            displayMyRank(data.my_rank);
            
            // ランキングを表示
            displayRanking(data.ranking);
        }
    } catch (error) {
        console.error('Load monthly ranking error:', error);
    }
}

// 自分の順位を表示
function displayMyRank(myRank) {
    const myRankDiv = document.getElementById('myRankDisplay');
    
    if (!myRank) {
        myRankDiv.innerHTML = '<p style="color: #6c757d;">今週のポイントがまだありません</p>';
        return;
    }
    
    const rankPosition = myRank.rank || myRank.rank_position || '未定';
    const pointsEarned = myRank.points_earned || 0;
    
    myRankDiv.innerHTML = `
        <div class="my-rank-content">
            <div>
                <div style="font-size: 14px; margin-bottom: 5px;">あなたの順位</div>
                <div class="my-rank-position">${rankPosition}位</div>
            </div>
            <div>
                <div style="font-size: 14px; margin-bottom: 5px;">今週のポイント</div>
                <div class="my-rank-points">${pointsEarned}pt</div>
            </div>
        </div>
    `;
}

// ランキングを表示（修正版）
function displayRanking(ranking) {
    const rankingList = document.getElementById('rankingList');
    
    if (ranking.length === 0) {
        rankingList.innerHTML = '<div class="no-ranking">まだランキングがありません</div>';
        return;
    }
    
    rankingList.innerHTML = '';
    // 重要: rankingList自体のスタイルを強制
    rankingList.style.textAlign = 'left';
    
    ranking.forEach((user, index) => {
        // rank または rank_position を使用（どちらかが存在する）
        const rank = user.rank || user.rank_position || (index + 1);
        const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
        
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        
        // 重要: 各要素に直接スタイルを適用
        rankingItem.style.display = 'flex';
        rankingItem.style.justifyContent = 'space-between';
        rankingItem.style.alignItems = 'center';
        rankingItem.style.textAlign = 'left';
        
        rankingItem.innerHTML = `
            <div class="ranking-left" style="display: flex; align-items: center; gap: 20px; flex: 1; justify-content: flex-start;">
                <div class="ranking-position ${rankClass}" style="min-width: 60px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${medal || rank}
                </div>
                <div class="ranking-user" style="display: flex; flex-direction: column; gap: 6px; flex: 1; text-align: left;">
                    <div class="ranking-name">${user.name || 'プレイヤー'}</div>
                    <div class="ranking-level">Lv.${user.level || 1}</div>
                </div>
            </div>
            <div class="ranking-points" style="font-size: 24px; font-weight: bold; color: #4aa3d8; flex-shrink: 0; min-width: 80px; text-align: right;">
                ${user.points_earned || 0}pt
            </div>
        `;
        
        rankingList.appendChild(rankingItem);
    });
}

// アバターを更新
function updateAvatar(level) {
    const avatarElement = document.getElementById('playerAvatar');
    
    if (level >= 10) {
        avatarElement.textContent = '🦅';
    } else if (level >= 6) {
        avatarElement.textContent = '🐓';
    } else if (level >= 3) {
        avatarElement.textContent = '🐥';
    } else {
        avatarElement.textContent = '🐣';
    }
}