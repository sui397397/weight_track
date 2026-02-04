// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage(); // 多言語対応
    
    checkAuth();
    initHamburgerMenu();
    
    // 今日の日付をデフォルトで設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('recordDate').value = today;
    
    // 今日の記録があれば読み込む
    loadTodayRecord();
    
    // 最近の記録を読み込む
    loadRecentRecords();
});

// 今日の記録を読み込む
async function loadTodayRecord() {
    const token = localStorage.getItem('token');
    const today = document.getElementById('recordDate').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/records/today', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.record) {
            // 既存の記録をフォームに表示
            document.getElementById('weight').value = data.record.weight;
            if (data.record.body_fat_percentage) {
                document.getElementById('bodyFat').value = data.record.body_fat_percentage;
            }
            if (data.record.memo) {
                document.getElementById('memo').value = data.record.memo;
            }
        }
    } catch (error) {
        console.error('Error loading today record:', error);
    }
}

// 記録を保存
document.getElementById('recordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const weight = document.getElementById('weight').value;
    const bodyFatPercentage = document.getElementById('bodyFat').value || null;
    const recordDate = document.getElementById('recordDate').value;
    const memo = document.getElementById('memo').value || null;
    
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    // メッセージをクリア
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    try {
        const response = await fetch('http://localhost:3000/api/records/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                weight,
                bodyFatPercentage,
                recordDate,
                memo
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            successDiv.textContent = data.message;
            successDiv.classList.add('show');
            
            // 最近の記録を再読み込み
            loadRecentRecords();
            
            // 3秒後にホーム画面に戻る
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
        console.error('Save record error:', error);
    }
});

// 最近の記録を読み込む
async function loadRecentRecords() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/records/recent', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        const recordsList = document.getElementById('recentRecords');
        
        if (data.success && data.records && data.records.length > 0) {
            recordsList.innerHTML = data.records.map(record => {
                const date = new Date(record.record_date);
                const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                
                return `
                    <div class="record-item">
                        <span class="record-date">${formattedDate}</span>
                        <div>
                            <span class="record-weight">${record.weight} kg</span>
                            ${record.body_fat_percentage ? `<span class="record-fat"> / ${record.body_fat_percentage}%</span>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            recordsList.innerHTML = '<p class="no-data">まだ記録がありません</p>';
        }
    } catch (error) {
        console.error('Error loading recent records:', error);
        document.getElementById('recentRecords').innerHTML = '<p class="no-data">記録の読み込みに失敗しました</p>';
    }
}