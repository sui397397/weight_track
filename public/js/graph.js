// ========================================
// グローバル変数
// ========================================
let weightChart = null;
let allRecords = [];
let mealRecords = [];
let exerciseRecords = [];

// ========================================
// ページ読み込み時の処理
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initHamburgerMenu();
    initTabs();
    initPeriodButtons();
    initSearchForm();
    loadAllData();
});

// ========================================
// タブ切り替え
// ========================================
function initTabs() {
    const tabButtons = document.querySelectorAll('.bi-tab');
    const tabContents = document.querySelectorAll('.bi-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // すべてのタブから active を削除
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // クリックされたタブに active を追加
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // 統計タブが開かれた時にデータを更新
            if (tabName === 'stats') {
                updateStatisticsTab();
            }
        });
    });
}

// ========================================
// 期間選択ボタン
// ========================================
function initPeriodButtons() {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const period = e.target.dataset.period;
            filterAndDisplayData(period);
        });
    });
}

// ========================================
// データ読み込み
// ========================================
async function loadAllData() {
    const token = localStorage.getItem('token');
    
    try {
        // 体重記録を取得
        const recordsResponse = await fetch(`${API_BASE_URL}/api/records/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const recordsData = await recordsResponse.json();
        
        if (recordsData.success && recordsData.records) {
            allRecords = recordsData.records;
            filterAndDisplayData('week'); // デフォルトで1週間表示
        } else {
            showNoDataMessage();
        }
        
        // 食事記録を取得
        try {
            const mealsResponse = await fetch(`${API_BASE_URL}/api/meals/recent`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const mealsData = await mealsResponse.json();
            if (mealsData.success) {
                mealRecords = mealsData.meals || [];
            }
        } catch (error) {
            console.log('食事記録の取得をスキップ');
        }
        
        // 運動記録を取得
        try {
            const exerciseResponse = await fetch(`${API_BASE_URL}/api/exercise/recent`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const exerciseData = await exerciseResponse.json();
            if (exerciseData.success) {
                exerciseRecords = exerciseData.exercises || [];
            }
        } catch (error) {
            console.log('運動記録の取得をスキップ');
        }
        
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        showNoDataMessage();
    }
}

// ========================================
// データをフィルタリングして表示
// ========================================
function filterAndDisplayData(period) {
    if (allRecords.length === 0) {
        showNoDataMessage();
        return;
    }
    
    let filteredRecords = allRecords;
    let days;
    
    switch(period) {
        case 'week':
            days = 7;
            break;
        case 'month':
            days = 30;
            break;
        case '3months':
            days = 90;
            break;
        case '6months':
            days = 180;
            break;
        case 'year':
            days = 365;
            break;
        case 'all':
            days = 99999;
            break;
        default:
            days = 7;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    filteredRecords = allRecords.filter(record => {
        const recordDate = new Date(record.record_date);
        return recordDate >= cutoffDate;
    });
    
    if (filteredRecords.length === 0) {
        showNoDataMessage();
        return;
    }
    
    displayWeightChart(filteredRecords);
}

// ========================================
// 体重グラフを表示
// ========================================
function displayWeightChart(records) {
    const ctx = document.getElementById('weightChart');
    
    if (!ctx) return;
    
    const labels = records.map(r => {
        const date = new Date(r.record_date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const weights = records.map(r => parseFloat(r.weight));
    
    // 既存のグラフを破棄
    if (weightChart) {
        weightChart.destroy();
    }
    
    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '体重 (kg)',
                data: weights,
                borderColor: '#6dd5ed',
                backgroundColor: 'rgba(109, 213, 237, 0.2)',
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#6dd5ed',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 14, weight: '600' },
                        color: '#355c7d',
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#355c7d',
                    bodyColor: '#666',
                    borderColor: '#6dd5ed',
                    borderWidth: 2,
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + ' kg';
                        }
                    }
                }
            }
        }
    });
}

// ========================================
// 検索機能
// ========================================
function initSearchForm() {
    const form = document.getElementById('searchForm');
    const resetBtn = document.getElementById('resetSearch');
    const exportBtn = document.getElementById('exportCSV');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
    });
    
    resetBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('searchResults').style.display = 'none';
        exportBtn.style.display = 'none';
    });
    
    exportBtn.addEventListener('click', () => {
        exportToCSV();
    });
}

function performSearch() {
    const weightMin = parseFloat(document.getElementById('weightMin').value) || 0;
    const weightMax = parseFloat(document.getElementById('weightMax').value) || 999;
    const fatMin = parseFloat(document.getElementById('fatMin').value) || 0;
    const fatMax = parseFloat(document.getElementById('fatMax').value) || 100;
    const dateMin = document.getElementById('dateMin').value;
    const dateMax = document.getElementById('dateMax').value;
    
    let results = allRecords.filter(record => {
        const weight = parseFloat(record.weight);
        const fat = parseFloat(record.body_fat_percentage) || 0;
        const date = new Date(record.record_date);
        
        // 体重チェック
        if (weight < weightMin || weight > weightMax) return false;
        
        // 体脂肪率チェック
        if (record.body_fat_percentage && (fat < fatMin || fat > fatMax)) return false;
        
        // 日付チェック
        if (dateMin && date < new Date(dateMin)) return false;
        if (dateMax && date > new Date(dateMax)) return false;
        
        return true;
    });
    
    displaySearchResults(results);
}

function displaySearchResults(results) {
    const resultsDiv = document.getElementById('searchResults');
    const tbody = document.getElementById('resultsBody');
    const countSpan = document.getElementById('resultCount');
    const exportBtn = document.getElementById('exportCSV');
    
    countSpan.textContent = results.length;
    
    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">検索結果がありません</td></tr>';
        exportBtn.style.display = 'none';
    } else {
        tbody.innerHTML = results.map(record => {
            const date = new Date(record.record_date);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            const fat = record.body_fat_percentage ? `${record.body_fat_percentage}%` : '--';
            const memo = record.memo || '--';
            
            return `
                <tr>
                    <td>${dateStr}</td>
                    <td>${record.weight} kg</td>
                    <td>${fat}</td>
                    <td class="memo-cell">${memo}</td>
                </tr>
            `;
        }).join('');
        
        exportBtn.style.display = 'inline-block';
    }
    
    resultsDiv.style.display = 'block';
    
    // 検索結果を保存（CSV出力用）
    window.currentSearchResults = results;
}

// ========================================
// CSV出力
// ========================================
function exportToCSV() {
    if (!window.currentSearchResults || window.currentSearchResults.length === 0) {
        alert('出力するデータがありません');
        return;
    }
    
    // CSVヘッダー
    let csv = '日付,体重(kg),体脂肪率(%),メモ\n';
    
    // データ行
    window.currentSearchResults.forEach(record => {
        const date = new Date(record.record_date);
        const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
        const fat = record.body_fat_percentage || '';
        const memo = (record.memo || '').replace(/,/g, '，'); // カンマをエスケープ
        
        csv += `${dateStr},${record.weight},${fat},"${memo}"\n`;
    });
    
    // ダウンロード
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `体重記録_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ========================================
// 統計タブの更新
// ========================================
function updateStatisticsTab() {
    if (allRecords.length === 0) return;
    
    updateDashboardCards();
    updateInsights();
    updateWeeklyStats();
    updateMonthlyStats();
    updateRecordStats();
}

// ダッシュボードカードの更新
function updateDashboardCards() {
    const weights = allRecords.map(r => parseFloat(r.weight));
    const dates = allRecords.map(r => new Date(r.record_date));
    
    const avg = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
    const max = Math.max(...weights);
    const min = Math.min(...weights);
    const maxIndex = weights.indexOf(max);
    const minIndex = weights.indexOf(min);
    const change = (weights[weights.length - 1] - weights[0]).toFixed(1);
    const changePercent = ((change / weights[0]) * 100).toFixed(1);
    
    document.getElementById('statAvg').textContent = `${avg} kg`;
    document.getElementById('statMax').textContent = `${max.toFixed(1)} kg`;
    document.getElementById('statMaxDate').textContent = `${dates[maxIndex].getMonth() + 1}/${dates[maxIndex].getDate()}`;
    document.getElementById('statMin').textContent = `${min.toFixed(1)} kg`;
    document.getElementById('statMinDate').textContent = `${dates[minIndex].getMonth() + 1}/${dates[minIndex].getDate()}`;
    
    const changeEl = document.getElementById('statChange');
    changeEl.textContent = `${change > 0 ? '+' : ''}${change} kg`;
    changeEl.style.color = change < 0 ? '#28a745' : change > 0 ? '#e74c3c' : '#666';
    
    document.getElementById('statChangePercent').textContent = `${change > 0 ? '+' : ''}${changePercent}%`;
}

// データインサイトの生成
function updateInsights() {
    const insights = [];
    const weights = allRecords.map(r => parseFloat(r.weight));
    
    // トレンド分析
    const recentWeights = weights.slice(-7);
    const avgRecent = recentWeights.reduce((a, b) => a + b, 0) / recentWeights.length;
    const oldWeights = weights.slice(0, 7);
    const avgOld = oldWeights.reduce((a, b) => a + b, 0) / oldWeights.length;
    
    if (avgRecent < avgOld) {
        insights.push({ type: 'success', icon: '✅', text: `良い傾向です！週平均で${(avgOld - avgRecent).toFixed(1)}kg減少しています` });
    } else if (avgRecent > avgOld) {
        insights.push({ type: 'warning', icon: '⚠️', text: `注意：週平均で${(avgRecent - avgOld).toFixed(1)}kg増加しています` });
    }
    
    // 記録継続率
    const recordDays = allRecords.length;
    const totalDays = Math.ceil((new Date() - new Date(allRecords[0].record_date)) / (1000 * 60 * 60 * 24));
    const recordRate = ((recordDays / totalDays) * 100).toFixed(0);
    
    if (recordRate >= 80) {
        insights.push({ type: 'success', icon: '🔥', text: `素晴らしい！記録継続率${recordRate}%です` });
    } else if (recordRate < 50) {
        insights.push({ type: 'info', icon: '📌', text: `記録継続率が${recordRate}%です。毎日記録すると効果的です` });
    }
    
    // 週末の傾向
    const weekendWeights = allRecords.filter(r => {
        const day = new Date(r.record_date).getDay();
        return day === 0 || day === 6;
    }).map(r => parseFloat(r.weight));
    
    const weekdayWeights = allRecords.filter(r => {
        const day = new Date(r.record_date).getDay();
        return day !== 0 && day !== 6;
    }).map(r => parseFloat(r.weight));
    
    if (weekendWeights.length > 0 && weekdayWeights.length > 0) {
        const weekendAvg = weekendWeights.reduce((a, b) => a + b, 0) / weekendWeights.length;
        const weekdayAvg = weekdayWeights.reduce((a, b) => a + b, 0) / weekdayWeights.length;
        
        if (weekendAvg > weekdayAvg + 0.5) {
            insights.push({ type: 'warning', icon: '⚠️', text: '週末に体重が増える傾向があります。食事管理を意識しましょう' });
        }
    }
    
    // 運動記録
    if (exerciseRecords.length > 0) {
        insights.push({ type: 'success', icon: '💪', text: `${exerciseRecords.length}回の運動記録があります。継続が大切です！` });
    } else {
        insights.push({ type: 'info', icon: '📌', text: '運動記録を追加すると、より効果的に体重管理できます' });
    }
    
    // HTMLに表示
    const insightsHTML = insights.map(insight => `
        <div class="insight-item ${insight.type}">
            <span class="insight-icon">${insight.icon}</span>
            <span class="insight-text">${insight.text}</span>
        </div>
    `).join('');
    
    document.getElementById('insightsContent').innerHTML = insightsHTML;
}

// 週別統計の更新
function updateWeeklyStats() {
    const weeks = {};
    
    allRecords.forEach(record => {
        const date = new Date(record.record_date);
        const weekNum = getWeekNumber(date);
        const weekKey = `${date.getFullYear()}-W${weekNum}`;
        
        if (!weeks[weekKey]) {
            weeks[weekKey] = [];
        }
        weeks[weekKey].push(parseFloat(record.weight));
    });
    
    const weeklyHTML = Object.keys(weeks).slice(-8).map(weekKey => {
        const weights = weeks[weekKey];
        const avg = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
        const [year, week] = weekKey.split('-W');
        
        return `
            <div class="stat-row">
                <span class="stat-label">${year}年 第${week}週</span>
                <span class="stat-value">${avg} kg</span>
                <span class="stat-count">(${weights.length}日)</span>
            </div>
        `;
    }).join('');
    
    document.getElementById('weeklyStatsContent').innerHTML = weeklyHTML || '<p class="no-data">データがありません</p>';
}

// 月別統計の更新
function updateMonthlyStats() {
    const months = {};
    
    allRecords.forEach(record => {
        const date = new Date(record.record_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!months[monthKey]) {
            months[monthKey] = [];
        }
        months[monthKey].push(parseFloat(record.weight));
    });
    
    const monthlyHTML = Object.keys(months).slice(-6).map(monthKey => {
        const weights = months[monthKey];
        const avg = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
        const [year, month] = monthKey.split('-');
        
        return `
            <div class="stat-row">
                <span class="stat-label">${year}年 ${parseInt(month)}月</span>
                <span class="stat-value">${avg} kg</span>
                <span class="stat-count">(${weights.length}日)</span>
            </div>
        `;
    }).join('');
    
    document.getElementById('monthlyStatsContent').innerHTML = monthlyHTML || '<p class="no-data">データがありません</p>';
}

// 記録統計の更新
function updateRecordStats() {
    const recordDays = allRecords.length;
    const firstDate = new Date(allRecords[0].record_date);
    const lastDate = new Date(allRecords[allRecords.length - 1].record_date);
    const totalDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    const recordRate = ((recordDays / totalDays) * 100).toFixed(1);
    
    // 連続記録日数を計算
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 1;
    
    for (let i = allRecords.length - 1; i > 0; i--) {
        const date1 = new Date(allRecords[i].record_date);
        const date2 = new Date(allRecords[i - 1].record_date);
        const diffDays = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            tempStreak++;
            if (i === allRecords.length - 1) {
                currentStreak = tempStreak;
            }
        } else {
            if (tempStreak > maxStreak) {
                maxStreak = tempStreak;
            }
            tempStreak = 1;
        }
    }
    
    if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
    }
    
    const statsHTML = `
        <div class="stat-row">
            <span class="stat-label">記録日数</span>
            <span class="stat-value">${recordDays}日</span>
            <span class="stat-count">/ ${totalDays}日 (${recordRate}%)</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">連続記録</span>
            <span class="stat-value">${currentStreak}日</span>
            <span class="stat-icon">🔥</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">最長連続</span>
            <span class="stat-value">${maxStreak}日</span>
            <span class="stat-icon">🏆</span>
        </div>
    `;
    
    document.getElementById('recordStatsContent').innerHTML = statsHTML;
}

// ========================================
// ユーティリティ関数
// ========================================

// 週番号を取得
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// データなしメッセージ
function showNoDataMessage() {
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
        chartContainer.innerHTML = '<p class="no-data">まだ記録がありません</p>';
    }
}