// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage(); // 多言語対応
    
    checkAuth();
    initHamburgerMenu();
    
    // 今日の日付をデフォルトで開始日に設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    
    // 1ヶ月後をデフォルトで目標日に設定
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    document.getElementById('endDate').value = oneMonthLater.toISOString().split('T')[0];
    
    // 現在の体重を自動入力
    loadCurrentWeight();
    
    // 現在の目標を読み込む
    loadCurrentGoal();
    
    // 日付変更時に期間を計算
    document.getElementById('startDate').addEventListener('change', calculateGoalInfo);
    document.getElementById('endDate').addEventListener('change', calculateGoalInfo);
    document.getElementById('targetWeight').addEventListener('input', calculateGoalInfo);
});

// 現在の体重を自動入力
async function loadCurrentWeight() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/records/all', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.records && data.records.length > 0) {
            // 最新の体重を設定
            const latestWeight = data.records[0].weight;
            document.getElementById('currentWeight').value = latestWeight;
        } else {
            // 記録がない場合の処理
            document.getElementById('currentWeight').value = '';
            document.getElementById('currentWeight').placeholder = '体重記録がありません';
        }
    } catch (error) {
        console.error('Error loading current weight:', error);
        document.getElementById('currentWeight').value = '';
        document.getElementById('currentWeight').placeholder = '読み込みエラー';
    }
}

// 現在の目標を読み込む
async function loadCurrentGoal() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/goals/active', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        const currentGoalCard = document.getElementById('currentGoalCard');
        const currentGoalContent = document.getElementById('currentGoalContent');
        
        if (data.success && data.goal) {
            const goal = data.goal;
            const startDate = new Date(goal.start_date).toLocaleDateString('ja-JP');
            const endDate = new Date(goal.end_date).toLocaleDateString('ja-JP');
            
            // 開始体重（current_weightまたはstart_weightから取得）
            const startWeight = goal.start_weight || goal.current_weight;
            
            // 最新の体重記録を取得して残りを計算
            let currentWeight = startWeight;
            let remaining = startWeight && goal.target_weight ? Math.abs(startWeight - goal.target_weight).toFixed(1) : '-';
            
            // 最新の体重を取得
            try {
                const recordResponse = await fetch('http://localhost:3000/api/records/recent', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const recordData = await recordResponse.json();
                
                if (recordData.success && recordData.records && recordData.records.length > 0) {
                    currentWeight = parseFloat(recordData.records[0].weight);
                    remaining = Math.abs(currentWeight - goal.target_weight).toFixed(1);
                }
            } catch (error) {
                console.error('Error fetching recent records:', error);
            }
            
            currentGoalCard.style.display = 'block';
            currentGoalContent.innerHTML = `
                <div class="current-goal-display">
                    <h4>目標体重</h4>
                    <div class="goal-target">${goal.target_weight} kg</div>
                    <div class="goal-period">${startDate} 〜 ${endDate}</div>
                    
                    <div class="progress-section">
                        <div class="progress-bar-container" data-progress="${(goal.progress || 0).toFixed(1)}%">
                            <div class="progress-bar-fill" style="width: ${goal.progress || 0}%"></div>
                        </div>
                        
                        <div class="goal-stats">
                            <div class="goal-stat-item">
                                <div class="goal-stat-label">開始体重</div>
                                <div class="goal-stat-value">${startWeight ? startWeight + ' kg' : '-'}</div>
                            </div>
                            <div class="goal-stat-item">
                                <div class="goal-stat-label">目標体重</div>
                                <div class="goal-stat-value">${goal.target_weight} kg</div>
                            </div>
                            <div class="goal-stat-item">
                                <div class="goal-stat-label">残り</div>
                                <div class="goal-stat-value">${remaining} kg</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            currentGoalCard.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading current goal:', error);
        currentGoalCard.style.display = 'none';
    }
}

// 目標情報を計算して表示
async function calculateGoalInfo() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const targetWeight = document.getElementById('targetWeight').value;
    
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 期間が不正な場合
    if (diffDays <= 0) {
        return;
    }
    
    // 現在の体重を取得してペースを計算
    if (targetWeight) {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:3000/api/records/recent', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.records && data.records.length > 0) {
                const currentWeight = parseFloat(data.records[0].weight);
                const target = parseFloat(targetWeight);
                const diff = Math.abs(currentWeight - target);
                const perWeek = (diff / diffDays * 7).toFixed(2);
                
                console.log(`推奨ペース: 週に約 ${perWeek} kg ${currentWeight > target ? '減量' : '増量'}`);
            }
        } catch (error) {
            console.error('Error calculating pace:', error);
        }
    }
}

// 目標を保存
document.getElementById('goalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const currentWeight = document.getElementById('currentWeight').value;
    const targetWeight = document.getElementById('targetWeight').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    // メッセージをクリア
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    // 日付の検証
    if (new Date(endDate) <= new Date(startDate)) {
        errorDiv.textContent = '目標日は開始日より後に設定してください';
        errorDiv.classList.add('show');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/goals/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentWeight,
                targetWeight,
                startDate,
                endDate
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            successDiv.textContent = data.message;
            successDiv.classList.add('show');
            
            // 現在の目標を再読み込み
            loadCurrentGoal();
            
            // フォームをリセット
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'サーバーエラーが発生しました';
        errorDiv.classList.add('show');
        console.error('Save goal error:', error);
    }
});