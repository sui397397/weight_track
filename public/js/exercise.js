// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();
    
    checkAuth();
    displayCurrentDate();
    initHamburgerMenu();
    
    // 今日の日付と現在時刻をデフォルトで設定
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    document.getElementById('exerciseDate').value = today;
    
    // 今日の運動記録を読み込む
    loadTodayExercises();
    
    // 最近の運動記録を読み込む
    loadRecentExercises();
    
    // フォーム送信
    document.getElementById('exerciseForm').addEventListener('submit', saveExerciseRecord);
});

// 運動記録を保存
async function saveExerciseRecord(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const exerciseType = document.getElementById('exerciseType').value;
    const exerciseName = document.getElementById('exerciseName').value;
    const duration = document.getElementById('duration').value;
    const caloriesBurned = document.getElementById('caloriesBurned').value || null;
    const distance = document.getElementById('distance').value || null;
    const exerciseDate = document.getElementById('exerciseDate').value;
    const memo = document.getElementById('memo').value || null;
    
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    // メッセージをクリア
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    try {
        const response = await fetch('http://localhost:3000/api/exercises/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                exerciseType,
                exerciseName,
                duration,
                caloriesBurned,
                distance,
                exerciseDate,
                memo
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            successDiv.textContent = data.message;
            successDiv.classList.add('show');
            
            // フォームをリセット
            document.getElementById('exerciseForm').reset();
            
            // 今日の日付を再設定
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('exerciseDate').value = today;
            
            // 今日の運動記録を再読み込み
            loadTodayExercises();
            loadRecentExercises();
            
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
        console.error('Save exercise record error:', error);
    }
}

// 今日の運動記録を読み込む
async function loadTodayExercises() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/exercises/today', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        const todayExercisesDiv = document.getElementById('todayExercises');
        
        if (data.success && data.exercises && data.exercises.length > 0) {
            todayExercisesDiv.innerHTML = data.exercises.map(exercise => createExerciseItemHTML(exercise)).join('');
            
            // 合計を更新
            updateTotals(data.exercises);
            
            // 削除ボタンのイベントリスナーを追加
            document.querySelectorAll('.exercise-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const exerciseId = e.target.dataset.exerciseId;
                    deleteExerciseRecord(exerciseId);
                });
            });
        } else {
            todayExercisesDiv.innerHTML = '<p class="no-data">まだ記録がありません</p>';
            updateTotals([]);
        }
    } catch (error) {
        console.error('Load today exercises error:', error);
    }
}

// 最近の運動記録を読み込む
async function loadRecentExercises() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:3000/api/exercises/recent', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        const recentExercisesDiv = document.getElementById('recentExercises');
        
        if (data.success && data.exercises && data.exercises.length > 0) {
            recentExercisesDiv.innerHTML = data.exercises.map(exercise => createExerciseItemHTML(exercise)).join('');
            
            // 削除ボタンのイベントリスナーを追加
            document.querySelectorAll('.exercise-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const exerciseId = e.target.dataset.exerciseId;
                    deleteExerciseRecord(exerciseId);
                });
            });
        } else {
            recentExercisesDiv.innerHTML = '<p class="no-data">記録がありません</p>';
        }
    } catch (error) {
        console.error('Load recent exercises error:', error);
    }
}

// 運動アイテムのHTML作成
function createExerciseItemHTML(exercise) {
    const exerciseTypeNames = {
        running: 'ランニング',
        walking: 'ウォーキング',
        cycling: 'サイクリング',
        swimming: '水泳',
        gym: 'ジム',
        yoga: 'ヨガ',
        other: 'その他'
    };
    
    let details = [];
    details.push(`<span>⏱️ ${exercise.duration}分</span>`);
    if (exercise.calories_burned) details.push(`<span>🔥 ${exercise.calories_burned} kcal</span>`);
    if (exercise.distance) details.push(`<span>📏 ${exercise.distance} km</span>`);
    
    return `
        <div class="exercise-item">
            <div class="exercise-header">
                <span class="exercise-type">${exerciseTypeNames[exercise.exercise_type]}</span>
                <button class="exercise-delete" data-exercise-id="${exercise.exercise_id}">削除</button>
            </div>
            <div class="exercise-name">${exercise.exercise_name}</div>
            <div class="exercise-details">${details.join('')}</div>
            ${exercise.memo ? `<div class="exercise-memo">💭 ${exercise.memo}</div>` : ''}
        </div>
    `;
}

// 合計を更新
function updateTotals(exercises) {
    const totals = {
        duration: exercises.reduce((sum, e) => sum + (parseInt(e.duration) || 0), 0),
        calories: exercises.reduce((sum, e) => sum + (parseInt(e.calories_burned) || 0), 0),
        distance: exercises.reduce((sum, e) => sum + (parseFloat(e.distance) || 0), 0).toFixed(1)
    };
    
    document.getElementById('totalDuration').textContent = totals.duration;
    document.getElementById('totalCalories').textContent = totals.calories;
    document.getElementById('totalDistance').textContent = totals.distance;
}

// 運動記録を削除
async function deleteExerciseRecord(exerciseId) {
    if (!confirm('この運動記録を削除しますか？')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:3000/api/exercises/${exerciseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadTodayExercises();
            loadRecentExercises();
        } else {
            alert('削除に失敗しました');
        }
    } catch (error) {
        console.error('Delete exercise record error:', error);
        alert('削除に失敗しました');
    }
}