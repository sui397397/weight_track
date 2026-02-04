// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    console.log('🍽️ meal.js: DOMContentLoaded開始');
    
    // updatePageLanguage(); // ← 関数が存在しないためコメントアウト
    
    checkAuth();
    displayCurrentDate();
    initHamburgerMenu();

    // 今日の日付をデフォルトで設定
    const today = new Date().toISOString().split('T')[0];

    const mealDateElement = document.getElementById('mealDate');
    if (mealDateElement) {
        mealDateElement.value = today;
    }

    // 今日の食事記録を読み込む
    loadTodayMeals();

    // 最近の食事記録を読み込む
    loadRecentMeals();

    // フォーム送信
    const mealForm = document.getElementById('mealForm');
    if (mealForm) {
        mealForm.addEventListener('submit', saveMealRecord);
        console.log('✅ フォーム送信イベント登録完了');
    }

    // 画像プレビュー機能
    const mealImageElement = document.getElementById('mealImage');
    console.log('🔍 mealImage要素:', mealImageElement);
    if (mealImageElement) {
        mealImageElement.addEventListener('change', handleImageSelect);
        console.log('✅ 画像変更イベント登録完了');
    } else {
        console.error('❌ mealImage要素が見つかりません');
    }

    // AI解析ボタン
    const aiAnalyzeBtn = document.getElementById('aiAnalyzeBtn');
    console.log('🔍 aiAnalyzeBtn要素:', aiAnalyzeBtn);
    if (aiAnalyzeBtn) {
        aiAnalyzeBtn.addEventListener('click', analyzeImageWithAI);
        console.log('✅ AI解析ボタンイベント登録完了');
    } else {
        console.error('❌ aiAnalyzeBtn要素が見つかりません');
    }
    
    console.log('🍽️ meal.js: DOMContentLoaded完了');
});

// 画像選択時の処理
function handleImageSelect(e) {
    console.log('📸 handleImageSelect呼び出し');
    const file = e.target.files[0];
    console.log('📁 選択されたファイル:', file);
    
    if (!file) {
        console.log('⚠️ ファイルが選択されていません');
        return;
    }

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
        console.log('❌ ファイルサイズオーバー:', file.size);
        showError('画像サイズは5MB以下にしてください');
        e.target.value = '';
        return;
    }

    console.log('✅ ファイルサイズOK:', file.size);

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = function (e) {
        console.log('✅ 画像読み込み完了');
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;

        // AI解析ボタンを表示
        const btn = document.getElementById('aiAnalyzeBtn');
        console.log('🤖 AI解析ボタンを表示:', btn);
        if (btn) {
            btn.style.display = 'block';
            console.log('✅ ボタン表示完了');
        } else {
            console.error('❌ AI解析ボタンが見つかりません');
        }
    };
    reader.readAsDataURL(file);
}

// AI画像解析
async function analyzeImageWithAI() {
    console.log('🤖 analyzeImageWithAI開始');
    const fileInput = document.getElementById('mealImage');
    const file = fileInput.files[0];

    if (!file) {
        showError('画像を選択してください');
        return;
    }

    // AI解析中の表示
    document.getElementById('aiAnalyzeBtn').style.display = 'none';
    document.getElementById('aiAnalyzing').style.display = 'flex';
    console.log('⏳ 解析中表示を開始');

    try {
        const token = localStorage.getItem('token');

        // 画像をBase64に変換（リサイズ付き）
        console.log('🔄 Base64変換開始');
        const base64Image = await fileToBase64WithResize(file, 800);
        console.log('✅ Base64変換完了');

        // APIリクエスト
        console.log('📤 APIリクエスト送信');
        const response = await fetch('http://localhost:3000/api/ai/analyze-food', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageBase64: `data:${file.type};base64,${base64Image}`
            })
        });

        console.log('📥 APIレスポンス受信:', response.status);

        // レスポンスのContent-Typeを確認
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('サーバーから正しいレスポンスが返されませんでした');
        }

        const data = await response.json();
        console.log('📊 解析結果:', data);

        if (data.success) {
            // 結果をフォームに自動入力
            fillFormWithAIResult(data.analysis);
            showSuccess('AI解析が完了しました！');
        } else {
            showError(data.message || 'AI解析に失敗しました');
        }
    } catch (error) {
        console.error('❌ AI analyze error:', error);
        showError('AI解析中にエラーが発生しました: ' + error.message);
    } finally {
        document.getElementById('aiAnalyzing').style.display = 'none';
        document.getElementById('aiAnalyzeBtn').style.display = 'block';
    }
}

// AI解析結果をフォームに入力
function fillFormWithAIResult(analysis) {
    console.log('📝 フォームに結果を入力:', analysis);
    
    // 食事名
    const dishName = analysis.dish_name || analysis.foodName;
    if (dishName) {
        const mealNameInput = document.getElementById('mealName');
        mealNameInput.value = dishName;
        mealNameInput.classList.add('ai-filled');
        console.log('✅ 食事名入力:', dishName);
    }

    // カロリー
    if (analysis.calories) {
        const caloriesInput = document.getElementById('calories');
        caloriesInput.value = Math.round(analysis.calories);
        caloriesInput.classList.add('ai-filled');
        console.log('✅ カロリー入力:', analysis.calories);
    }

    // タンパク質
    if (analysis.protein) {
        const proteinInput = document.getElementById('protein');
        proteinInput.value = analysis.protein.toFixed(1);
        proteinInput.classList.add('ai-filled');
        console.log('✅ タンパク質入力:', analysis.protein);
    }

    // 炭水化物
    if (analysis.carbs) {
        const carbsInput = document.getElementById('carbs');
        carbsInput.value = analysis.carbs.toFixed(1);
        carbsInput.classList.add('ai-filled');
        console.log('✅ 炭水化物入力:', analysis.carbs);
    }

    // 脂質
    if (analysis.fat) {
        const fatInput = document.getElementById('fat');
        fatInput.value = analysis.fat.toFixed(1);
        fatInput.classList.add('ai-filled');
        console.log('✅ 脂質入力:', analysis.fat);
    }

    // メモ（AIの説明）
    if (analysis.description) {
        const memoInput = document.getElementById('memo');
        memoInput.value = `🤖 AI解析: ${analysis.description}`;
        console.log('✅ メモ入力:', analysis.description);
    }

    // アニメーション効果を解除
    setTimeout(() => {
        document.querySelectorAll('.ai-filled').forEach(el => {
            el.classList.remove('ai-filled');
        });
    }, 2000);
}

// ファイルをBase64に変換（リサイズ付き）
function fileToBase64WithResize(file, maxWidth = 800) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // リサイズ処理
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Base64に変換（品質80%）
                const base64 = canvas.toDataURL(file.type, 0.8).split(',')[1];
                resolve(base64);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// エラーメッセージ表示
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

// 成功メッセージ表示
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.add('show');
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 3000);
    }
}

// 食事記録を保存
async function saveMealRecord(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const formData = new FormData();

    // フォームデータを追加
    formData.append('mealType', document.getElementById('mealType').value);
    formData.append('mealName', document.getElementById('mealName').value);
    formData.append('calories', document.getElementById('calories').value || '');
    formData.append('protein', document.getElementById('protein').value || '');
    formData.append('carbs', document.getElementById('carbs').value || '');
    formData.append('fat', document.getElementById('fat').value || '');
    formData.append('mealDate', document.getElementById('mealDate').value);
    formData.append('memo', document.getElementById('memo').value || '');

    // 画像ファイルを追加
    const imageFile = document.getElementById('mealImage').files[0];
    if (imageFile) {
        formData.append('mealImage', imageFile);
    }

    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');

    // メッセージをクリア
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');

    try {
        const response = await fetch('http://localhost:3000/api/meals/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            successDiv.textContent = data.message;
            successDiv.classList.add('show');

            // フォームをリセット
            document.getElementById('mealForm').reset();

            // 画像プレビューとAI解析ボタンをクリア
            const previewDiv = document.getElementById('imagePreview');
            if (previewDiv) {
                previewDiv.innerHTML = '';
            }
            document.getElementById('aiAnalyzeBtn').style.display = 'none';

            // 今日の日付を再設定
            const today = new Date().toISOString().split('T')[0];
            const mealDateElement = document.getElementById('mealDate');
            if (mealDateElement) {
                mealDateElement.value = today;
            }

            // 今日の食事記録を再読み込み
            loadTodayMeals();
            loadRecentMeals();

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
        console.error('Save meal record error:', error);
    }
}

// 今日の食事記録を読み込む
async function loadTodayMeals() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3000/api/meals/today', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        // 今日の合計を計算
        if (data.success && data.meals && data.meals.length > 0) {
            updateTotals(data.meals);
        } else {
            updateTotals([]);
        }
    } catch (error) {
        console.error('Load today meals error:', error);
        updateTotals([]);
    }
}

// 最近の食事記録を読み込む
async function loadRecentMeals() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3000/api/meals/recent', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        const recentMealsDiv = document.getElementById('recentMeals');

        if (!recentMealsDiv) return;

        if (data.success && data.meals && data.meals.length > 0) {
            recentMealsDiv.innerHTML = data.meals.map(meal => createMealItemHTML(meal)).join('');

            // 削除ボタンのイベントリスナーを追加
            document.querySelectorAll('.meal-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mealId = e.target.dataset.mealId;
                    deleteMealRecord(mealId);
                });
            });
        } else {
            recentMealsDiv.innerHTML = '<p class="no-data">記録がありません</p>';
        }
    } catch (error) {
        console.error('Load recent meals error:', error);
        const recentMealsDiv = document.getElementById('recentMeals');
        if (recentMealsDiv) {
            recentMealsDiv.innerHTML = '<p class="no-data">記録の読み込みに失敗しました</p>';
        }
    }
}

// 食事アイテムのHTML作成
function createMealItemHTML(meal) {
    const mealTypeNames = {
        breakfast: '朝食',
        lunch: '昼食',
        dinner: '夕食',
        snack: '間食'
    };

    let nutrients = [];
    if (meal.calories) nutrients.push(`<span>🔥 ${meal.calories} kcal</span>`);
    if (meal.protein) nutrients.push(`<span>🥩 タンパク質 ${meal.protein}g</span>`);
    if (meal.carbs) nutrients.push(`<span>🍚 炭水化物 ${meal.carbs}g</span>`);
    if (meal.fat) nutrients.push(`<span>🧈 脂質 ${meal.fat}g</span>`);

    // 日付のフォーマット
    const mealDate = new Date(meal.meal_date);
    const dateStr = `${mealDate.getMonth() + 1}/${mealDate.getDate()}`;

    return `
        <div class="meal-item">
            <div class="meal-header">
                <span class="meal-type">${mealTypeNames[meal.meal_type] || meal.meal_type}</span>
                <div>
                    <span class="meal-date">${dateStr}</span>
                    <button class="meal-delete" data-meal-id="${meal.meal_id}">削除</button>
                </div>
            </div>
            <div class="meal-name">${meal.meal_name}</div>
            ${meal.image_path ? `<img src="/uploads/${meal.image_path}" alt="${meal.meal_name}" class="meal-image" onclick="showImageModal(this.src)">` : ''}
            ${nutrients.length > 0 ? `<div class="meal-nutrients">${nutrients.join('')}</div>` : ''}
            ${meal.memo ? `<div class="meal-memo">💭 ${meal.memo}</div>` : ''}
        </div>
    `;
}

// 合計を更新
function updateTotals(meals) {
    const totals = {
        calories: meals.reduce((sum, m) => sum + (parseFloat(m.calories) || 0), 0).toFixed(0),
        protein: meals.reduce((sum, m) => sum + (parseFloat(m.protein) || 0), 0).toFixed(1),
        carbs: meals.reduce((sum, m) => sum + (parseFloat(m.carbs) || 0), 0).toFixed(1),
        fat: meals.reduce((sum, m) => sum + (parseFloat(m.fat) || 0), 0).toFixed(1)
    };

    const totalCaloriesElement = document.getElementById('totalCalories');
    const totalProteinElement = document.getElementById('totalProtein');
    const totalCarbsElement = document.getElementById('totalCarbs');
    const totalFatElement = document.getElementById('totalFat');

    if (totalCaloriesElement) totalCaloriesElement.textContent = totals.calories;
    if (totalProteinElement) totalProteinElement.textContent = totals.protein;
    if (totalCarbsElement) totalCarbsElement.textContent = totals.carbs;
    if (totalFatElement) totalFatElement.textContent = totals.fat;
}

// 食事記録を削除
async function deleteMealRecord(mealId) {
    if (!confirm('この食事記録を削除しますか？')) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:3000/api/meals/${mealId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            loadTodayMeals();
            loadRecentMeals();
        } else {
            alert('削除に失敗しました');
        }
    } catch (error) {
        console.error('Delete meal record error:', error);
        alert('削除に失敗しました');
    }
}

// 画像モーダル表示
function showImageModal(src) {
    // モーダルを作成
    const modal = document.createElement('div');
    modal.className = 'image-modal show';
    modal.innerHTML = `<img src="${src}" alt="食事画像">`;

    // クリックで閉じる
    modal.addEventListener('click', () => {
        modal.remove();
    });

    document.body.appendChild(modal);
}