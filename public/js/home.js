// ページ読み込み時に言語を適用
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage(); // 多言語対応

    checkAuth();
    displayUserName();
    initHamburgerMenu();
    initFloatingGameButton(); // フローティングアバター育成ボタン初期化
    loadDashboard(); // すべてのデータ読み込みはここで実行

    // 期間タブの切り替え
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            // アクティブ状態を切り替え
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 期間に応じてグラフを更新
            const period = parseInt(btn.dataset.period);
            const token = localStorage.getItem('token');

            try {
                const response = await fetch('http://localhost:3000/api/records/all', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if (data.success && data.records) {
                    const filteredRecords = data.records.slice(0, period);
                    updateChart(filteredRecords);
                }
            } catch (error) {
                console.error('Error updating chart:', error);
            }
        });
    });
});

// 認証チェック
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// ユーザー名表示
function displayUserName() {
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }
}

// ダッシュボードデータ読み込み
async function loadDashboard() {
    const token = localStorage.getItem('token');

    try {
        // 今日の記録を取得
        await loadTodayRecord(token);

        // アバター育成情報を取得
        await loadGameInfo(token);

        // 最近の記録を取得
        const records = await loadRecentRecords(token);

        console.log('Dashboard records:', records);

        // 目標進捗を取得
        await loadGoalProgress(token);

        // グラフと統計を更新
        if (records && records.length > 0) {
            updateChart(records);
            updateStats(records);
        }

    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// 今日の記録を取得（新デザイン対応）
async function loadTodayRecord(token) {
    const today = new Date().toISOString().split('T')[0];

    try {
        const response = await fetch(`http://localhost:3000/api/records/date/${today}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        const todayRecordDiv = document.getElementById('todayRecord');

        if (data.success && data.record) {
            const record = data.record;

            // 前日の記録を取得して比較
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            let changeHtml = '<span class="change-value neutral">--</span>';

            try {
                const yesterdayResponse = await fetch(`http://localhost:3000/api/records/date/${yesterdayStr}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const yesterdayData = await yesterdayResponse.json();

                if (yesterdayData.success && yesterdayData.record) {
                    const change = (parseFloat(record.weight) - parseFloat(yesterdayData.record.weight)).toFixed(1);
                    const changeClass = change > 0 ? 'positive' : (change < 0 ? 'negative' : 'neutral');
                    changeHtml = `<span class="change-value ${changeClass}">${change} kg</span>`;
                }
            } catch (error) {
                console.error('Error loading yesterday record:', error);
            }

            // 記録時刻のフォーマット（修正版）
            const recordDate = new Date(record.record_date);

            // record_dateに時間情報が含まれているか確認
            // MySQLのDATETIME型の場合は時間も含まれる
            // DATE型の場合は00:00:00になる
            const dateString = record.record_date;
            let timeStr;

            // 時刻部分があるかチェック（DATETIME形式: "YYYY-MM-DD HH:MM:SS"）
            if (dateString.includes(' ') || dateString.includes('T')) {
                // 時間情報が含まれている場合
                const hours = recordDate.getHours();
                const minutes = recordDate.getMinutes();
                timeStr = `${recordDate.getMonth() + 1}/${recordDate.getDate()} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            } else {
                // 日付のみの場合
                timeStr = `${recordDate.getMonth() + 1}/${recordDate.getDate()}`;
            }

            // メモがある場合の表示
            const memoHtml = record.memo ? `
                <div class="detail-item full-width">
                    <div class="detail-icon">📝</div>
                    <div class="detail-info">
                        <div class="detail-label">メモ</div>
                        <div class="detail-value memo-text">${record.memo}</div>
                    </div>
                </div>
            ` : '';

            todayRecordDiv.innerHTML = `
                <div class="today-record-content" style="display: block;">
                    <!-- 体重メイン表示 -->
                    <div class="weight-main">
                        <div class="weight-value-large">${record.weight}</div>
                        <div class="weight-change">
                            <span class="change-label">前日比</span>
                            ${changeHtml}
                        </div>
                    </div>
                    
                    <!-- 詳細情報グリッド -->
                    <div class="record-details-grid">
                        <div class="detail-item">
                            <div class="detail-icon">💧</div>
                            <div class="detail-info">
                                <div class="detail-label">体脂肪率</div>
                                <div class="detail-value">${record.body_fat_percentage || '--'} ${record.body_fat_percentage ? '%' : ''}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-icon">📅</div>
                            <div class="detail-info">
                                <div class="detail-label">記録日時</div>
                                <div class="detail-value" style="font-size: 14px;">${timeStr}</div>
                            </div>
                        </div>
                        ${memoHtml}
                    </div>
                    
                    <!-- 編集ボタン -->
                    <button class="btn-secondary btn-edit" onclick="location.href='record.html'">
                        <span>✏️</span> 記録を編集
                    </button>
                </div>
            `;
        } else {
            todayRecordDiv.innerHTML = `
                <div class="no-record-state">
                    <p class="no-data">まだ記録がありません</p>
                    <button class="btn-primary" onclick="location.href='record.html'">
                        記録を追加
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading today record:', error);
    }
}

// 最近の記録を取得
async function loadRecentRecords(token) {
    const response = await fetch('http://localhost:3000/api/records/all', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    const recentRecordsDiv = document.getElementById('recentRecords');

    if (data.success && data.records && data.records.length > 0) {
        const recentRecords = data.records.slice(0, 5);

        // 日付をシンプルな形式にフォーマット
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}/${month}/${day}`;
        };

        recentRecordsDiv.innerHTML = recentRecords.map(record => `
            <div class="record-item">
                <span class="record-date">${formatDate(record.record_date)}</span>
                <span class="record-weight">${record.weight} kg</span>
                ${record.body_fat_percentage ? `<span class="record-fat">${record.body_fat_percentage}%</span>` : ''}
            </div>
        `).join('');

        return data.records;
    } else {
        recentRecordsDiv.innerHTML = '<p class="no-data">記録がありません</p>';
        return [];
    }
}

// 目標進捗を取得
async function loadGoalProgress(token) {
    const response = await fetch('http://localhost:3000/api/goals/active', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    const goalProgressDiv = document.getElementById('goalProgress');

    if (data.success && data.goal) {
        const goal = data.goal;
        const progress = goal.progress || 0;

        // 日付をシンプルな形式にフォーマット
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}/${month}/${day}`;
        };

        const startDate = formatDate(goal.start_date);
        const endDate = formatDate(goal.end_date);

        goalProgressDiv.innerHTML = `
            <div class="goal-info">
                <p><strong>目標体重:</strong> ${goal.target_weight} kg</p>
                <p><strong>期間:</strong> ${startDate} 〜 ${endDate}</p>
            </div>
            <div class="progress-bar-container" data-progress="${progress.toFixed(1)}%">
                <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            <p class="progress-text">${progress.toFixed(1)}% 達成</p>
        `;
    } else {
        goalProgressDiv.innerHTML = `
            <p class="no-data">目標が設定されていません</p>
            <button class="btn-secondary" onclick="location.href='goal.html'">
                目標を設定
            </button>
        `;
    }
}

// グラフ更新
let weightChart = null;

function updateChart(records) {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;

    const labels = records.slice(0, 7).map(r => {
        const date = new Date(r.record_date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const data = records.slice(0, 7).map(r => parseFloat(r.weight));

    if (weightChart) {
        weightChart.destroy();
    }

    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '体重 (kg)',
                data: data,
                borderColor: '#6dd5ed',
                backgroundColor: 'rgba(109, 213, 237, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#6dd5ed',
                pointBorderColor: 'white',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: '#f0f0f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 統計更新
function updateStats(records) {
    if (records.length === 0) return;

    const weights = records.map(r => parseFloat(r.weight));
    const avg = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
    const max = Math.max(...weights).toFixed(1);
    const min = Math.min(...weights).toFixed(1);

    document.getElementById('avgWeight').textContent = avg + ' kg';
    document.getElementById('maxWeight').textContent = max + ' kg';
    document.getElementById('minWeight').textContent = min + ' kg';
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

// アバター育成情報を読み込み
async function loadGameInfo(token) {
    const gameInfoDiv = document.getElementById('gameInfo');

    try {
        // プレイヤー進捗を取得
        const progressResponse = await fetch('http://localhost:3000/api/game/progress', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const progressData = await progressResponse.json();

        if (!progressData.success) {
            throw new Error('Failed to load progress');
        }

        const progress = progressData.progress;

        // アバターの決定（レベルに応じて進化）
        function getAvatarByLevel(level) {
            if (level >= 10) {
                return '🦅';
            } else if (level >= 6) {
                return '🐓';
            } else if (level >= 3) {
                return '🐥';
            } else {
                return '🐣';
            }
        }

        // 使い方
        const avatar = getAvatarByLevel(progress.level);

        // XPバーのパーセンテージ計算
        const xpPercent = (progress.current_xp / progress.xp_to_next_level) * 100;

        // 連続記録日数を取得
        const streakResponse = await fetch('http://localhost:3000/api/game/streak', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const streakData = await streakResponse.json();
        const currentStreak = streakData.success ? streakData.streak.current_streak : 0;

        // ランキング情報を取得
        const weeklyRankResponse = await fetch('http://localhost:3000/api/game/ranking/weekly', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const weeklyRankData = await weeklyRankResponse.json();

        const monthlyRankResponse = await fetch('http://localhost:3000/api/game/ranking/monthly', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const monthlyRankData = await monthlyRankResponse.json();

        // 自分のランキングを見つける
        let weeklyRank = '-';
        let weeklyMedal = '';
        if (weeklyRankData.success && weeklyRankData.ranking) {
            const myWeekly = weeklyRankData.ranking.find(r => r.is_current_user);
            if (myWeekly) {
                weeklyRank = myWeekly.rank + '位';
                if (myWeekly.rank === 1) weeklyMedal = '🥇';
                else if (myWeekly.rank === 2) weeklyMedal = '🥈';
                else if (myWeekly.rank === 3) weeklyMedal = '🥉';
            }
        }

        let monthlyRank = '-';
        let monthlyMedal = '';
        if (monthlyRankData.success && monthlyRankData.ranking) {
            const myMonthly = monthlyRankData.ranking.find(r => r.is_current_user);
            if (myMonthly) {
                monthlyRank = myMonthly.rank + '位';
                if (myMonthly.rank === 1) monthlyMedal = '🥇';
                else if (myMonthly.rank === 2) monthlyMedal = '🥈';
                else if (myMonthly.rank === 3) monthlyMedal = '🥉';
            }
        }

        // 最近獲得したバッジを取得（最新3個）
        const badgesResponse = await fetch('http://localhost:3000/api/game/badges', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const badgesData = await badgesResponse.json();

        // 🔧 修正: 獲得済みバッジを先に定義（スコープ対策）
        const earnedBadges = badgesData.success && badgesData.badges ? badgesData.badges.filter(b => b.earned) : [];

        // バッジHTML生成
        let badgesHtml = '<div class="no-badges">まだバッジがありません</div>';
        if (earnedBadges.length > 0) {
            const recentBadges = earnedBadges.slice(0, 3);
            badgesHtml = recentBadges.map(badge => {
                    // アイコンの決定: 画像 > 絵文字 > デフォルト
                    let iconHtml;
                    if (badge.icon_image) {
                        iconHtml = `<img src="${badge.icon_image}" alt="${badge.badge_name || 'バッジ'}">`;
                    } else {
                        iconHtml = badge.icon_emoji || badge.icon || '🏆';
                    }

                    return `
        <div class="badge-mini" onclick="location.href='game.html#badges'" title="${badge.badge_description || badge.description || ''}">
            <div class="badge-mini-icon">${iconHtml}</div>
            <div class="badge-mini-name">${badge.badge_name || badge.name || 'バッジ'}</div>
        </div>
    `;
                }).join('');
        }

        // HTML生成
        gameInfoDiv.innerHTML = `
            <!-- プレイヤーステータス -->
            <div class="player-status">
                <div class="avatar-display">${avatar}</div>
                <div class="status-info">
                    <div class="level-display">
                        <div class="level-badge">
                            <span class="level-icon">⭐</span>
                            <span>Level ${progress.level}</span>
                        </div>
                        <div class="xp-info">${progress.current_xp} / ${progress.xp_to_next_level} XP</div>
                    </div>
                    <div class="xp-bar-container">
                        <div class="xp-bar-fill" style="width: ${xpPercent}%"></div>
                    </div>
                    <div class="points-display">
                        <span class="points-icon">⚡</span>
                        <span>${progress.total_points.toLocaleString()} ポイント</span>
                    </div>
                </div>
            </div>
            
            <!-- アバター育成統計 -->
            <div class="game-stats-grid">
                <div class="game-stat-box">
                    <div class="game-stat-icon">🔥</div>
                    <div class="game-stat-content">
                        <div class="game-stat-label">連続記録</div>
                        <div class="game-stat-value streak-value">${currentStreak}日</div>
                    </div>
                </div>
                <div class="game-stat-box">
                    <div class="game-stat-icon">🏆</div>
                    <div class="game-stat-content">
                        <div class="game-stat-label">獲得バッジ</div>
                        <div class="game-stat-value">${earnedBadges.length}個</div>
                    </div>
                </div>
            </div>
            
            <!-- ランキング -->
            <div class="ranking-display">
                <div class="ranking-item">
                    <div class="ranking-label">週間ランキング</div>
                    <div class="ranking-value">
                        ${weeklyMedal ? `<span class="ranking-medal">${weeklyMedal}</span>` : ''}
                        <span class="rank-value">${weeklyRank}</span>
                    </div>
                </div>
                <div class="ranking-item">
                    <div class="ranking-label">月間ランキング</div>
                    <div class="ranking-value">
                        ${monthlyMedal ? `<span class="ranking-medal">${monthlyMedal}</span>` : ''}
                        <span class="rank-value">${monthlyRank}</span>
                    </div>
                </div>
            </div>
            
            <!-- 最近のバッジ -->
            <div class="recent-badges-section">
                <h4>🏅 最近のバッジ</h4>
                <div class="badges-container">
                    ${badgesHtml}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading game info:', error);
        gameInfoDiv.innerHTML = `
            <div class="game-loading">
                <p style="color: #e57373;">アバター育成情報の読み込みに失敗しました</p>
            </div>
        `;
    }
}

// フローティングアバター育成ボタンの初期化
function initFloatingGameButton() {
    const floatingBtn = document.getElementById('floatingGameBtn');
    if (!floatingBtn) return;

    const floatingIcon = floatingBtn.querySelector('.floating-game-icon');
    const floatingPopup = document.getElementById('floatingGamePopup');
    const floatingClose = document.getElementById('floatingPopupClose');

    // アイコンクリックでポップアップ表示
    floatingIcon.addEventListener('click', async () => {
        const isActive = floatingPopup.classList.contains('active');

        if (!isActive) {
            floatingPopup.classList.add('active');
            // ポップアップにアバター育成情報を読み込み
            await loadFloatingGameInfo();
        } else {
            floatingPopup.classList.remove('active');
        }
    });

    // 閉じるボタン
    floatingClose.addEventListener('click', (e) => {
        e.stopPropagation();
        floatingPopup.classList.remove('active');
    });

    // ポップアップ外クリックで閉じる
    document.addEventListener('click', (e) => {
        if (!floatingBtn.contains(e.target)) {
            floatingPopup.classList.remove('active');
        }
    });
}

// フローティングポップアップにアバター育成情報を読み込み
async function loadFloatingGameInfo() {
    const token = localStorage.getItem('token');
    const contentDiv = document.getElementById('floatingPopupContent');

    try {
        // プレイヤー進捗を取得
        const progressResponse = await fetch('http://localhost:3000/api/game/progress', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const progressData = await progressResponse.json();

        if (!progressData.success) {
            throw new Error('Failed to load progress');
        }

        const progress = progressData.progress;

        // アバターの決定（レベルに応じて進化）
        function getAvatarByLevel(level) {
            if (level >= 10) {
                return '🦅';
            } else if (level >= 6) {
                return '🐓';
            } else if (level >= 3) {
                return '🐥';
            } else {
                return '🐣';
            }
        }

        // 使い方
        const avatar = getAvatarByLevel(progress.level);

        // XPバーのパーセンテージ計算
        const xpPercent = (progress.current_xp / progress.xp_to_next_level) * 100;

        // 連続記録日数を取得
        const streakResponse = await fetch('http://localhost:3000/api/game/streak', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const streakData = await streakResponse.json();
        const currentStreak = streakData.success ? streakData.streak.current_streak : 0;

        // バッジを取得
        const badgesResponse = await fetch('http://localhost:3000/api/game/badges', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const badgesData = await badgesResponse.json();
        
        // 🔧 修正: 獲得済みバッジのみをカウント
        const earnedBadges = badgesData.success && badgesData.badges ? badgesData.badges.filter(b => b.earned) : [];
        const badgeCount = earnedBadges.length;

        // 🔧 修正: 獲得済みバッジのみ表示
        let badgesHtml = '';
        if (earnedBadges.length > 0) {
            const recentBadges = earnedBadges.slice(0, 3);
            badgesHtml = recentBadges.map(badge => {
                // アイコンの決定: 画像 > 絵文字 > デフォルト
                let iconHtml;
                if (badge.icon_image) {
                    iconHtml = `<img src="${badge.icon_image}" alt="${badge.badge_name || 'バッジ'}">`;
                } else {
                    iconHtml = badge.icon_emoji || badge.icon || '🏆';
                }

                return `
        <div class="badge-mini" onclick="location.href='game.html#badges'" title="${badge.badge_description || badge.description || ''}">
            <div class="badge-mini-icon">${iconHtml}</div>
            <div class="badge-mini-name">${badge.badge_name || badge.name || 'バッジ'}</div>
        </div>
    `;
            }).join('');
        } else {
            badgesHtml = '<p style="text-align: center; color: #999; padding: 10px;">まだバッジがありません</p>';
        }

        // HTML生成
        contentDiv.innerHTML = `
            <div class="popup-mini-level">
                <div class="popup-mini-avatar">${avatar}</div>
                <div class="popup-mini-level-info">
                    <div class="popup-mini-level-text">Level ${progress.level}</div>
                    <div class="popup-mini-xp-bar">
                        <div class="popup-mini-xp-fill" style="width: ${xpPercent}%"></div>
                    </div>
                    <div class="popup-mini-xp-text">${progress.current_xp} / ${progress.xp_to_next_level} XP</div>
                </div>
            </div>
            
            <div class="popup-mini-stats">
                <div class="popup-mini-stat">
                    <div class="popup-mini-stat-value">🔥 ${currentStreak}</div>
                    <div class="popup-mini-stat-label">連続記録</div>
                </div>
                <div class="popup-mini-stat">
                    <div class="popup-mini-stat-value">🏆 ${badgeCount}</div>
                    <div class="popup-mini-stat-label">獲得バッジ</div>
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <h5 style="font-size: 14px; color: #666; margin-bottom: 10px;">最近のバッジ</h5>
                <div class="popup-mini-badges">
                    ${badgesHtml}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading floating game info:', error);
        contentDiv.innerHTML = `
            <p style="text-align: center; color: #e57373; padding: 20px;">
                情報の読み込みに失敗しました
            </p>
        `;
    }
}