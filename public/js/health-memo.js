// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();
    
    checkAuth();
    displayCurrentDate();
    initHamburgerMenu();
    
    // 今日の日付をデフォルトで設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('memoDate').value = today;
    
    // 最近の体調メモを読み込む
    loadRecentMemos();
    
    // フォーム送信
    document.getElementById('healthMemoForm').addEventListener('submit', saveHealthMemo);
    
    // 日付変更時に既存のメモを読み込む
    document.getElementById('memoDate').addEventListener('change', loadMemoByDate);
    
    // 初回読み込み
    loadMemoByDate();
});

// 体調メモを保存
async function saveHealthMemo(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const memoDate = document.getElementById('memoDate').value;
    const conditionRating = document.querySelector('input[name="conditionRating"]:checked')?.value || null;
    const sleepHours = document.getElementById('sleepHours').value || null;
    const stressLevel = document.querySelector('input[name="stressLevel"]:checked')?.value || null;
    const memo = document.getElementById('memo').value || null;
    
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    // メッセージをクリア
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    try {
        const response = await fetch('http://localhost:3000/api/health-memo/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                memoDate,
                conditionRating,
                sleepHours,
                stressLevel,
                memo
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            successDiv.textContent = data.message;
            successDiv.classList.add('show');
            
            // フォームをリセット
            document.getElementById('healthMemoForm').reset();
            
            // 今日の日付を再設定
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('memoDate').value = today;
            
            // 最近の体調メモを再読み込み
            loadRecentMemos();
            
            // 3秒後にメッセージを消す
            setTimeout(() => {
                successDiv.classList.remove('show');
            }, 3000);
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'サーバーエラーが発生しました';
        errorDiv.classList.add('show');
        console.error('Save health memo error:', error);
    }
}

// 特定日のメモを読み込む
async function loadMemoByDate() {
    const token = localStorage.getItem('token');
    const date = document.getElementById('memoDate').value;
    
    if (!date) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/health-memo/date/${date}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.memo) {
            const memo = data.memo;
            
            // フォームに値を設定
            if (memo.condition_rating) {
                document.getElementById(`condition${memo.condition_rating}`).checked = true;
            }
            if (memo.sleep_hours) {
                document.getElementById('sleepHours').value = memo.sleep_hours;
            }
            if (memo.stress_level) {
                document.getElementById(`stress${memo.stress_level}`).checked = true;
            }
            if (memo.memo) {
                document.getElementById('memo').value = memo.memo;
            }
        } else {
            // メモがない場合はフォームをクリア
            document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
            document.getElementById('sleepHours').value = '';
            document.getElementById('memo').value = '';
        }
    } catch (error) {
        console.error('Load memo by date error:', error);
    }
}

// 最近の体調メモを読み込む
async function loadRecentMemos() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/health-memo/recent', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        const recentMemosDiv = document.getElementById('recentMemos');
        
        if (data.success && data.memos && data.memos.length > 0) {
            recentMemosDiv.innerHTML = data.memos.map(memo => createMemoItemHTML(memo)).join('');
            
            // 削除ボタンのイベントリスナーを追加
            document.querySelectorAll('.memo-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const memoId = e.target.dataset.memoId;
                    deleteHealthMemo(memoId);
                });
            });
        } else {
            recentMemosDiv.innerHTML = '<p class="no-data">記録がありません</p>';
        }
    } catch (error) {
        console.error('Load recent memos error:', error);
    }
}

// メモアイテムのHTML作成
function createMemoItemHTML(memo) {
    const conditionLabels = {
        5: '😄 とても良い',
        4: '🙂 良い',
        3: '😐 普通',
        2: '😔 悪い',
        1: '😫 とても悪い'
    };
    
    const stressLabels = {
        5: '😰 非常に高い',
        4: '😟 高い',
        3: '😐 普通',
        2: '🙂 低い',
        1: '😌 非常に低い'
    };
    
    let ratings = [];
    if (memo.condition_rating) ratings.push(`<span>体調: ${conditionLabels[memo.condition_rating]}</span>`);
    if (memo.sleep_hours) ratings.push(`<span>😴 睡眠: ${memo.sleep_hours}時間</span>`);
    if (memo.stress_level) ratings.push(`<span>ストレス: ${stressLabels[memo.stress_level]}</span>`);
    
    return `
        <div class="memo-item">
            <div class="memo-header">
                <span class="memo-date">${memo.memo_date}</span>
                <button class="memo-delete" data-memo-id="${memo.memo_id}">削除</button>
            </div>
            ${ratings.length > 0 ? `<div class="memo-ratings">${ratings.join('')}</div>` : ''}
            ${memo.memo ? `<div class="memo-text">${memo.memo}</div>` : ''}
        </div>
    `;
}

// 体調メモを削除
async function deleteHealthMemo(memoId) {
    if (!confirm('この体調メモを削除しますか？')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:3000/api/health-memo/${memoId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadRecentMemos();
            loadMemoByDate();
        } else {
            alert('削除に失敗しました');
        }
    } catch (error) {
        console.error('Delete health memo error:', error);
        alert('削除に失敗しました');
    }
}