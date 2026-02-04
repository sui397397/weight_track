const db = require('../config/database');

// ユーザーの進捗を取得
exports.getProgress = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // user_progressがなければ作成
        let [progress] = await db.query(
            'SELECT * FROM user_progress WHERE user_id = ?',
            [userId]
        );
        
        if (progress.length === 0) {
            await db.query(
                'INSERT INTO user_progress (user_id) VALUES (?)',
                [userId]
            );
            [progress] = await db.query(
                'SELECT * FROM user_progress WHERE user_id = ?',
                [userId]
            );
        }
        
        const currentProgress = progress[0];
        
        // レベルアップチェック
        let currentXP = currentProgress.experience_points;
        let currentLevel = currentProgress.level;
        let xpForNextLevel = currentLevel * 100;
        let levelsGained = 0;
        
        // レベルアップ処理
        while (currentXP >= xpForNextLevel) {
            currentXP -= xpForNextLevel;
            currentLevel++;
            xpForNextLevel = currentLevel * 100;
            levelsGained++;
        }
        
        // レベルアップがあった場合、データベースを更新
        if (levelsGained > 0) {
            await db.query(
                'UPDATE user_progress SET level = ?, experience_points = ? WHERE user_id = ?',
                [currentLevel, currentXP, userId]
            );
            
            // 更新後の値を返す
            return res.json({
                success: true,
                progress: {
                    user_id: userId,
                    level: currentLevel,
                    current_xp: currentXP,
                    xp_to_next_level: xpForNextLevel,
                    total_points: currentProgress.total_points,
                    current_streak: currentProgress.current_streak,
                    longest_streak: currentProgress.longest_streak
                }
            });
        }
        
        // レベルアップがない場合は既存の値を返す
        res.json({
            success: true,
            progress: {
                user_id: userId,
                level: currentProgress.level,
                current_xp: currentProgress.experience_points,
                xp_to_next_level: currentProgress.level * 100,
                total_points: currentProgress.total_points,
                current_streak: currentProgress.current_streak,
                longest_streak: currentProgress.longest_streak
            }
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// ユーザーのバッジを取得（🔧 修正版：badge_id順に表示）
exports.getBadges = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // 全バッジを取得（icon_image と icon_emoji を含む）
        // 🔧 修正: badge_id順に並べ替え（シンプルで正確）
        const [allBadges] = await db.query(`
            SELECT 
                badge_id,
                badge_name,
                badge_description as description,
                icon_emoji,
                icon_image,
                condition_type,
                condition_value,
                badge_points
            FROM badges 
            ORDER BY badge_id ASC
        `);
        
        // 獲得済みバッジのIDを取得
        const [earnedBadgeIds] = await db.query(
            'SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?',
            [userId]
        );
        
        // 獲得済みバッジのマップを作成
        const earnedMap = {};
        earnedBadgeIds.forEach(row => {
            earnedMap[row.badge_id] = row.earned_at;
        });
        
        // 全バッジに獲得情報を付与
        const badgesWithStatus = allBadges.map(badge => ({
            ...badge,
            earned: !!earnedMap[badge.badge_id],
            earned_at: earnedMap[badge.badge_id] || null
        }));
        
        res.json({
            success: true,
            badges: badgesWithStatus,
            earned_count: earnedBadgeIds.length,
            total_count: allBadges.length
        });
    } catch (error) {
        console.error('Get badges error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 連続記録日数を取得
exports.getStreak = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const [rows] = await db.query(`
            SELECT current_streak, longest_streak, last_record_date
            FROM user_progress
            WHERE user_id = ?
        `, [userId]);
        
        if (rows.length === 0) {
            return res.json({
                success: true,
                streak: {
                    current_streak: 0,
                    longest_streak: 0,
                    last_record_date: null
                }
            });
        }
        
        res.json({
            success: true,
            streak: rows[0]
        });
    } catch (error) {
        console.error('Get streak error:', error);
        res.status(500).json({
            success: false,
            message: 'ストリーク情報の取得に失敗しました'
        });
    }
};

// ポイントを加算
exports.addPoints = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { points, source } = req.body; // source: 'weight', 'meal', 'exercise'
        
        // user_progressを取得または作成
        let [progress] = await db.query(
            'SELECT * FROM user_progress WHERE user_id = ?',
            [userId]
        );
        
        if (progress.length === 0) {
            await db.query(
                'INSERT INTO user_progress (user_id) VALUES (?)',
                [userId]
            );
            [progress] = await db.query(
                'SELECT * FROM user_progress WHERE user_id = ?',
                [userId]
            );
        }
        
        const currentProgress = progress[0];
        const newTotalPoints = currentProgress.total_points + points;
        
        // 経験値にポイントを加算
        let currentXP = currentProgress.experience_points + points;
        let currentLevel = currentProgress.level;
        let xpForNextLevel = currentLevel * 100;
        
        // レベルアップ判定
        while (currentXP >= xpForNextLevel) {
            currentXP -= xpForNextLevel;
            currentLevel++;
            xpForNextLevel = currentLevel * 100;
        }
        
        // 連続記録判定
        const today = new Date().toISOString().split('T')[0];
        const lastRecordDate = currentProgress.last_record_date;
        let newStreak = currentProgress.current_streak;
        
        if (lastRecordDate) {
            const lastDate = new Date(lastRecordDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // 連続記録
                newStreak++;
            } else if (diffDays > 1) {
                // 連続が途切れた
                newStreak = 1;
            }
            // diffDays === 0 の場合（同日）は変更なし
        } else {
            newStreak = 1;
        }
        
        const newLongestStreak = Math.max(newStreak, currentProgress.longest_streak);
        
        // 進捗を更新
        await db.query(
            `UPDATE user_progress 
             SET total_points = ?, 
                 experience_points = ?, 
                 level = ?,
                 current_streak = ?,
                 longest_streak = ?,
                 last_record_date = ?
             WHERE user_id = ?`,
            [newTotalPoints, currentXP, currentLevel, newStreak, newLongestStreak, today, userId]
        );
        
        // 週間ポイントを更新
        await updateWeeklyPoints(userId, points);
        
        // 月間ポイントを更新
        await updateMonthlyPoints(userId, points);
        
        // レベルアップしたかチェック
        const leveledUp = currentLevel > currentProgress.level;
        
        // バッジチェック
        const newBadges = await checkAndAwardBadges(userId);
        
        res.json({
            success: true,
            points_added: points,
            new_total: newTotalPoints,
            level: currentLevel,
            leveled_up: leveledUp,
            current_streak: newStreak,
            new_badges: newBadges
        });
    } catch (error) {
        console.error('Add points error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 週間ポイントを更新
async function updateWeeklyPoints(userId, points) {
    try {
        // 今週の月曜日を取得
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 月曜日を週の開始とする
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + diff);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];
        
        // 今週のレコードがあるか確認
        const [existing] = await db.query(
            'SELECT * FROM weekly_points WHERE user_id = ? AND week_start = ?',
            [userId, weekStartStr]
        );
        
        if (existing.length > 0) {
            // 既存のレコードを更新
            await db.query(
                'UPDATE weekly_points SET points_earned = points_earned + ? WHERE user_id = ? AND week_start = ?',
                [points, userId, weekStartStr]
            );
        } else {
            // 新規レコードを作成
            await db.query(
                'INSERT INTO weekly_points (user_id, week_start, week_end, points_earned) VALUES (?, ?, ?, ?)',
                [userId, weekStartStr, weekEndStr, points]
            );
        }
    } catch (error) {
        console.error('Update weekly points error:', error);
    }
}

// 月間ポイントを更新
async function updateMonthlyPoints(userId, points) {
    try {
        // 今月の1日を取得
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        const monthStartStr = monthStart.toISOString().split('T')[0];
        const monthEndStr = monthEnd.toISOString().split('T')[0];
        
        // 今月のレコードがあるか確認
        const [existing] = await db.query(
            'SELECT * FROM monthly_points WHERE user_id = ? AND month_start = ?',
            [userId, monthStartStr]
        );
        
        if (existing.length > 0) {
            // 既存のレコードを更新
            await db.query(
                'UPDATE monthly_points SET points_earned = points_earned + ? WHERE user_id = ? AND month_start = ?',
                [points, userId, monthStartStr]
            );
        } else {
            // 新規レコードを作成
            await db.query(
                'INSERT INTO monthly_points (user_id, month_start, month_end, points_earned) VALUES (?, ?, ?, ?)',
                [userId, monthStartStr, monthEndStr, points]
            );
        }
    } catch (error) {
        console.error('Update monthly points error:', error);
    }
}

// バッジ獲得判定（修正版）
async function checkAndAwardBadges(userId) {
    try {
        const newBadges = [];
        
        // 進捗を取得
        const [progress] = await db.query(
            'SELECT * FROM user_progress WHERE user_id = ?',
            [userId]
        );
        
        if (progress.length === 0) return newBadges;
        
        const userProgress = progress[0];
        
        // 体重記録の総数
        const [weightRecords] = await db.query(
            'SELECT COUNT(DISTINCT record_date) as count FROM weight_records WHERE user_id = ?',
            [userId]
        );
        const totalWeightDays = weightRecords[0].count;
        
        // 食事記録の総数
        const [mealRecords] = await db.query(
            'SELECT COUNT(*) as count FROM meal_records WHERE user_id = ?',
            [userId]
        );
        const totalMeals = mealRecords[0].count;
        
        // 運動記録の総数
        const [exerciseRecords] = await db.query(
            'SELECT COUNT(*) as count FROM exercise_records WHERE user_id = ?',
            [userId]
        );
        const totalExercises = exerciseRecords[0].count;
        
        // 体重減量計算
        const [firstWeight] = await db.query(
            'SELECT weight FROM weight_records WHERE user_id = ? ORDER BY record_date ASC LIMIT 1',
            [userId]
        );
        const [latestWeight] = await db.query(
            'SELECT weight FROM weight_records WHERE user_id = ? ORDER BY record_date DESC LIMIT 1',
            [userId]
        );
        
        let weightLoss = 0;
        if (firstWeight.length > 0 && latestWeight.length > 0) {
            weightLoss = firstWeight[0].weight - latestWeight[0].weight;
        }
        
        // 🔧 修正: badge_definitions → badges に変更
        const [allBadges] = await db.query('SELECT * FROM badges');
        
        // 既に獲得済みのバッジを取得
        const [earnedBadgeIds] = await db.query(
            'SELECT badge_id FROM user_badges WHERE user_id = ?',
            [userId]
        );
        const earnedIds = earnedBadgeIds.map(row => row.badge_id);
        
        // 各バッジの条件をチェック
        for (const badge of allBadges) {
            // 既に獲得済みならスキップ
            if (earnedIds.includes(badge.badge_id)) continue;
            
            let conditionMet = false;
            
            switch (badge.condition_type) {
                case 'first_record':
                    conditionMet = totalWeightDays >= 1;
                    break;
                case 'streak':
                    conditionMet = userProgress.current_streak >= badge.condition_value;
                    break;
                case 'total_days':
                    conditionMet = totalWeightDays >= badge.condition_value;
                    break;
                case 'weight_loss':
                    conditionMet = weightLoss >= badge.condition_value;
                    break;
                case 'meal_count':
                    conditionMet = totalMeals >= badge.condition_value;
                    break;
                case 'exercise_count':
                    conditionMet = totalExercises >= badge.condition_value;
                    break;
            }
            
            // 条件を満たしていればバッジを付与
            if (conditionMet) {
                await db.query(
                    'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
                    [userId, badge.badge_id]
                );
                newBadges.push(badge);
                
                // ボーナスポイントを付与
                if (badge.badge_points > 0) {
                    await db.query(
                        'UPDATE user_progress SET total_points = total_points + ?, experience_points = experience_points + ? WHERE user_id = ?',
                        [badge.badge_points, badge.badge_points, userId]
                    );
                }
            }
        }
        
        return newBadges;
    } catch (error) {
        console.error('Check badges error:', error);
        return [];
    }
}

// 週間ランキングを取得
exports.getWeeklyRanking = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // 今週の月曜日を取得
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + diff);
        weekStart.setHours(0, 0, 0, 0);
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        // トップ10を取得
        const [ranking] = await db.query(
            `SELECT 
                wp.user_id,
                COALESCE(u.nickname, u.name) as name,
                wp.points_earned,
                up.level,
                (wp.user_id = ?) as is_current_user,
                RANK() OVER (ORDER BY wp.points_earned DESC) as \`rank\`
             FROM weekly_points wp
             JOIN users u ON wp.user_id = u.user_id
             LEFT JOIN user_progress up ON wp.user_id = up.user_id
             WHERE wp.week_start = ? AND u.show_in_ranking = TRUE
             ORDER BY wp.points_earned DESC
             LIMIT 10`,
            [userId, weekStartStr]
        );
        
        res.json({
            success: true,
            ranking: ranking,
            week_start: weekStartStr
        });
    } catch (error) {
        console.error('Get weekly ranking error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// 月間ランキングを取得
exports.getMonthlyRanking = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // 今月の1日を取得
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split('T')[0];
        
        // トップ10を取得（ランキング非表示ユーザーを除外）
        const [ranking] = await db.query(
            `SELECT 
                mp.user_id,
                COALESCE(u.nickname, u.name) as name,
                mp.points_earned,
                up.level,
                (mp.user_id = ?) as is_current_user,
                RANK() OVER (ORDER BY mp.points_earned DESC) as \`rank\`
             FROM monthly_points mp
             JOIN users u ON mp.user_id = u.user_id
             LEFT JOIN user_progress up ON mp.user_id = up.user_id
             WHERE mp.month_start = ? AND u.show_in_ranking = TRUE
             ORDER BY mp.points_earned DESC
             LIMIT 10`,
            [userId, monthStartStr]
        );
        
        res.json({
            success: true,
            ranking: ranking,
            month_start: monthStartStr
        });
    } catch (error) {
        console.error('Get monthly ranking error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

// ログインボーナスをチェック＆付与
exports.checkLoginBonus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const today = new Date().toISOString().split('T')[0];
        
        // 今日すでにログインボーナスを受け取っているか確認
        const [existing] = await db.query(
            'SELECT * FROM login_bonuses WHERE user_id = ? AND login_date = ?',
            [userId, today]
        );
        
        if (existing.length > 0) {
            // すでに受け取り済み
            return res.json({
                success: true,
                already_received: true,
                message: '本日のログインボーナスは受け取り済みです'
            });
        }
        
        // ログインボーナスポイント
        const bonusPoints = 5;
        
        // ログインボーナスを記録
        await db.query(
            'INSERT INTO login_bonuses (user_id, login_date, points_earned) VALUES (?, ?, ?)',
            [userId, today, bonusPoints]
        );
        
        // user_progressがなければ作成
        let [progress] = await db.query(
            'SELECT * FROM user_progress WHERE user_id = ?',
            [userId]
        );
        
        if (progress.length === 0) {
            await db.query(
                'INSERT INTO user_progress (user_id) VALUES (?)',
                [userId]
            );
            [progress] = await db.query(
                'SELECT * FROM user_progress WHERE user_id = ?',
                [userId]
            );
        }
        
        const currentProgress = progress[0];
        const newTotalPoints = currentProgress.total_points + bonusPoints;
        
        // 経験値にポイントを加算
        let currentXP = currentProgress.experience_points + bonusPoints;
        let currentLevel = currentProgress.level;
        let xpForNextLevel = currentLevel * 100;
        
        // レベルアップ判定
        while (currentXP >= xpForNextLevel) {
            currentXP -= xpForNextLevel;
            currentLevel++;
            xpForNextLevel = currentLevel * 100;
        }
        
        // 進捗を更新
        await db.query(
            'UPDATE user_progress SET total_points = ?, experience_points = ?, level = ? WHERE user_id = ?',
            [newTotalPoints, currentXP, currentLevel, userId]
        );
        
        res.json({
            success: true,
            already_received: false,
            bonus_points: bonusPoints,
            new_total: newTotalPoints,
            level: currentLevel,
            leveled_up: currentLevel > currentProgress.level,
            message: `ログインボーナス ${bonusPoints}pt を獲得しました！`
        });
    } catch (error) {
        console.error('Check login bonus error:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

module.exports = exports;