// 現在表示中の年月
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;

// 記録データ
let records = {
    weight: [],
    meals: [],
    exercises: []
};

// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage(); // 多言語対応
    
    checkAuth();
    initHamburgerMenu();
    
    // カレンダーを表示
    renderCalendar();
    
    // ボタンイベント
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
});

// カレンダーを描画
async function renderCalendar() {
    // 月間データを取得
    await loadMonthData();
    
    // 月を表示
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    document.getElementById('currentMonth').textContent = `${currentYear}年${monthNames[currentMonth]}`;
    
    // カレンダー日付を生成
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevLastDay = new Date(currentYear, currentMonth, 0);
    
    const firstDayIndex = firstDay.getDay(); // 0=日曜日
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();
    const nextDays = 7 - lastDay.getDay() - 1;
    
    let days = '';
    
    // 前月の日付
    for (let x = firstDayIndex; x > 0; x--) {
        days += `<div class="calendar-day other-month">
            <div class="day-number">${prevLastDayDate - x + 1}</div>
        </div>`;
    }
    
    // 当月の日付
    for (let i = 1; i <= lastDayDate; i++) {
        const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const today = new Date().toISOString().split('T')[0];
        const isToday = date === today;
        
        // この日の記録をチェック（日付のみで比較）
        const hasWeight = records.weight.some(r => {
            const recordDate = r.record_date.split('T')[0];
            return recordDate === date;
        });
        const hasMeal = records.meals.some(r => {
            const mealDate = r.meal_date.split('T')[0];
            return mealDate === date;
        });
        const hasExercise = records.exercises.some(r => {
            const exerciseDate = r.exercise_date.split('T')[0];
            return exerciseDate === date;
        });
        
        let indicators = '';
        if (hasWeight) indicators += '<div class="indicator weight"></div>';
        if (hasMeal) indicators += '<div class="indicator meal"></div>';
        if (hasExercise) indicators += '<div class="indicator exercise"></div>';
        
        days += `<div class="calendar-day ${isToday ? 'today' : ''}" data-date="${date}">
            <div class="day-number">${i}</div>
            <div class="day-indicators">${indicators}</div>
        </div>`;
    }
    
    // 次月の日付
    for (let j = 1; j <= nextDays; j++) {
        days += `<div class="calendar-day other-month">
            <div class="day-number">${j}</div>
        </div>`;
    }
    
    document.getElementById('calendarBody').innerHTML = days;
    
    // 日付クリックイベント
    document.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
        day.addEventListener('click', (e) => {
            const clickedDate = e.currentTarget.dataset.date;
            showDayDetail(clickedDate);
            
            // 選択状態を更新
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
    });
    
    // 月間統計を更新
    updateMonthSummary();
}

// 月間データを取得
async function loadMonthData() {
    const token = localStorage.getItem('token');
    
    try {
        // 体重記録を取得
        const weightRes = await fetch('http://localhost:3000/api/records/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const weightData = await weightRes.json();
        records.weight = weightData.success ? weightData.records.filter(r => {
            const date = new Date(r.record_date);
            return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        }) : [];
        
        // 食事記録を取得
        const mealRes = await fetch('http://localhost:3000/api/meals/recent', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const mealData = await mealRes.json();
        records.meals = mealData.success ? mealData.meals.filter(r => {
            const date = new Date(r.meal_date);
            return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        }) : [];
        
        // 運動記録を取得
        const exerciseRes = await fetch('http://localhost:3000/api/exercises/recent', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const exerciseData = await exerciseRes.json();
        records.exercises = exerciseData.success ? exerciseData.exercises.filter(r => {
            const date = new Date(r.exercise_date);
            return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        }) : [];
        
    } catch (error) {
        console.error('Load month data error:', error);
    }
}

// 月間統計を更新
function updateMonthSummary() {
    // ユニークな日付数を計算
    const uniqueDates = new Set();
    
    records.weight.forEach(r => {
        const date = r.record_date.split('T')[0];
        uniqueDates.add(date);
    });
    records.meals.forEach(r => {
        const date = r.meal_date.split('T')[0];
        uniqueDates.add(date);
    });
    records.exercises.forEach(r => {
        const date = r.exercise_date.split('T')[0];
        uniqueDates.add(date);
    });
    
    document.getElementById('recordDays').textContent = uniqueDates.size;
    document.getElementById('mealCount').textContent = records.meals.length;
    document.getElementById('exerciseCount').textContent = records.exercises.length;
}

// 日付の詳細を表示
function showDayDetail(date) {
    selectedDate = date;
    
    // 日付を表示
    const dateObj = new Date(date + 'T00:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('selectedDate').textContent = dateObj.toLocaleDateString('ja-JP', options);
    
    let detailContent = '';
    
    // 体重記録
    const weightRecords = records.weight.filter(r => r.record_date.split('T')[0] === date);
    if (weightRecords.length > 0) {
        const w = weightRecords[0];
        detailContent += `
            <h4>体重記録</h4>
            <div class="detail-item">
                <strong>体重:</strong> ${w.weight} kg
                ${w.body_fat_percentage ? `<br><strong>体脂肪率:</strong> ${w.body_fat_percentage}%` : ''}
                ${w.memo ? `<br><strong>メモ:</strong> ${w.memo}` : ''}
            </div>
        `;
    }
    
    // 食事記録
    const mealRecords = records.meals.filter(r => r.meal_date.split('T')[0] === date);
    if (mealRecords.length > 0) {
        const mealTypeNames = {
            breakfast: '朝食',
            lunch: '昼食',
            dinner: '夕食',
            snack: '間食'
        };
        detailContent += '<h4>食事記録</h4>';
        detailContent += mealRecords.map(m => `
            <div class="detail-item">
                <strong>${mealTypeNames[m.meal_type]}:</strong> ${m.meal_name}
                ${m.calories ? ` (${m.calories} kcal)` : ''}
            </div>
        `).join('');
    }
    
    // 運動記録
    const exerciseRecords = records.exercises.filter(r => r.exercise_date.split('T')[0] === date);
    if (exerciseRecords.length > 0) {
        const exerciseTypeNames = {
            running: 'ランニング',
            walking: 'ウォーキング',
            cycling: 'サイクリング',
            swimming: '水泳',
            gym: 'ジム',
            yoga: 'ヨガ',
            other: 'その他'
        };
        detailContent += '<h4>運動記録</h4>';
        detailContent += exerciseRecords.map(e => `
            <div class="detail-item">
                <strong>${exerciseTypeNames[e.exercise_type]}:</strong> ${e.exercise_name} (${e.duration}分)
                ${e.calories_burned ? ` - ${e.calories_burned} kcal消費` : ''}
            </div>
        `).join('');
    }
    
    if (detailContent === '') {
        detailContent = '<p class="no-data">この日の記録はありません</p>';
    }
    
    document.getElementById('dayDetailContent').innerHTML = detailContent;
    
    // 詳細エリアを表示
    document.getElementById('dayDetail').style.display = 'block';
}