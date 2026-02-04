const ja = {
    // ナビゲーション
    nav: {
        home: 'ホーム',
        record: '体重記録',
        meal: '食事記録',
        exercise: '運動記録',
        healthMemo: '体調メモ',
        calendar: 'カレンダー',
        graph: 'グラフ',
        goal: '目標設定',
        ai: 'AI相談',
        profile: 'プロフィール',
        notification: '通知設定',
        settings: '設定',
        help: 'ヘルプ',
        terms: '利用規約',
        language: '言語変更',
        logout: 'ログアウト',
        deleteAccount: 'アカウント削除',
        menu: 'メニュー'
    },
    
    // 共通
    common: {
        save: '保存',
        cancel: 'キャンセル',
        delete: '削除',
        edit: '編集',
        close: '閉じる',
        loading: '読み込み中...',
        noData: 'データがありません',
        backToHome: 'ホームに戻る',
        required: '必須',
        optional: '任意'
    },
    
    // ホーム
    home: {
        title: 'ホーム',
        welcome: 'おかえりなさい',
        todayRecord: '今日の記録',
        weightProgress: '体重推移',
        goalProgress: '目標進捗',
        recentRecords: '最近の記録',
        addRecord: '記録を追加',
        setGoal: '目標を設定',
        statistics: '統計情報',
        average: '平均',
        highest: '最高',
        lowest: '最低',
        noRecordYet: 'まだ記録がありません',
        noGoalSet: '目標が設定されていません'
    },
    
    // 体重記録
    record: {
        title: '体重記録',
        weight: '体重',
        bodyFat: '体脂肪率',
        memo: 'メモ',
        date: '日付',
        saveRecord: '記録を保存',
        weightPlaceholder: '例: 70.5',
        bodyFatPlaceholder: '例: 20.5',
        memoPlaceholder: 'メモを入力',
        recordSaved: '体重記録を保存しました'
    },
    
    // 食事記録
    meal: {
        title: '食事記録',
        recordMeal: '食事を記録',
        mealType: '食事タイプ',
        mealName: '食事名',
        calories: 'カロリー',
        protein: 'タンパク質',
        carbs: '炭水化物',
        fat: '脂質',
        photo: '写真',
        time: '時刻',
        breakfast: '朝食',
        lunch: '昼食',
        dinner: '夕食',
        snack: '間食',
        todayMeals: '今日の食事',
        todayTotal: '今日の合計',
        recentMeals: '最近の食事記録',
        mealSaved: '食事記録を保存しました'
    },
    
    // 運動記録
    exercise: {
        title: '運動記録',
        recordExercise: '運動を記録',
        exerciseType: '運動タイプ',
        exerciseName: '運動名',
        duration: '時間（分）',
        caloriesBurned: '消費カロリー',
        distance: '距離',
        running: 'ランニング',
        walking: 'ウォーキング',
        cycling: 'サイクリング',
        swimming: '水泳',
        gym: 'ジム',
        yoga: 'ヨガ',
        other: 'その他',
        todayExercises: '今日の運動',
        recentExercises: '最近の運動記録',
        exerciseSaved: '運動記録を保存しました'
    },
    
    // 体調メモ
    healthMemo: {
        title: '体調メモ',
        recordHealth: '今日の体調を記録',
        conditionRating: '体調評価',
        sleepHours: '睡眠時間',
        stressLevel: 'ストレスレベル',
        veryGood: 'とても良い',
        good: '良い',
        normal: '普通',
        bad: '悪い',
        veryBad: 'とても悪い',
        veryHigh: '非常に高い',
        high: '高い',
        low: '低い',
        veryLow: '非常に低い',
        recentMemos: '最近の体調メモ',
        memoSaved: '体調メモを保存しました'
    },
    
    // カレンダー
    calendar: {
        title: '記録カレンダー',
        prevMonth: '前月',
        nextMonth: '次月',
        recordDays: '記録日数',
        mealCount: '食事記録',
        exerciseCount: '運動記録',
        sunday: '日',
        monday: '月',
        tuesday: '火',
        wednesday: '水',
        thursday: '木',
        friday: '金',
        saturday: '土'
    },
    
    // グラフ
    graph: {
        title: 'グラフ',
        weightGraph: '体重推移グラフ',
        period: '期間',
        week: '1週間',
        month: '1ヶ月',
        threeMonths: '3ヶ月',
        sixMonths: '6ヶ月',
        year: '1年'
    },
    
    // 目標設定
    goal: {
        title: '目標設定',
        setGoal: '目標を設定',
        currentWeight: '現在の体重',
        targetWeight: '目標体重',
        startDate: '開始日',
        endDate: '終了日',
        progress: '進捗',
        achieved: '達成',
        goalSaved: '目標を設定しました',
        activeGoal: '現在の目標'
    },
    
    // AI相談
    ai: {
        title: 'AI相談',
        askQuestion: '質問を入力',
        send: '送信',
        conversationHistory: '会話履歴',
        placeholder: '体重管理について質問してください'
    },
    
    // プロフィール
    profile: {
        title: 'プロフィール編集',
        basicInfo: '基本情報',
        email: 'メールアドレス',
        name: '名前',
        gender: '性別',
        birthDate: '生年月日',
        male: '男性',
        female: '女性',
        registeredDate: '登録日',
        changePassword: 'パスワード変更',
        currentPassword: '現在のパスワード',
        newPassword: '新しいパスワード',
        confirmPassword: '新しいパスワード（確認）',
        updateProfile: 'プロフィールを更新',
        updatePassword: 'パスワードを変更',
        profileUpdated: 'プロフィールを更新しました',
        passwordChanged: 'パスワードを変更しました',
        emailNote: 'メールアドレスは変更できません',
        passwordNote: '6文字以上で入力してください'
    },
    
    // 通知設定
    notification: {
        title: '通知設定',
        notificationSettings: '通知の設定',
        dailyReminder: '毎日のリマインダー',
        reminderTime: '通知時刻',
        goalAchievement: '目標達成通知',
        weeklyReport: '週次レポート',
        browserNotification: 'ブラウザ通知',
        allowNotification: '通知を許可する',
        testNotification: 'テスト通知を送信',
        settingsSaved: '通知設定を更新しました',
        dailyReminderDesc: '毎日決まった時刻に記録のリマインダーを受け取ります',
        goalAchievementDesc: '目標を達成したときに通知を受け取ります',
        weeklyReportDesc: '毎週月曜日に1週間の記録レポートを受け取ります',
        notificationGranted: '通知が許可されています',
        notificationDenied: '通知が拒否されています',
        notificationDefault: '通知が許可されていません'
    },
    
    // ヘルプ
    help: {
        title: 'ヘルプ・よくある質問',
        userGuide: '使い方ガイド',
        faq: 'よくある質問（FAQ）',
        howToRecord: '体重を記録する',
        howToMeal: '食事を記録する',
        howToExercise: '運動を記録する',
        howToGoal: '目標を設定する'
    },
    
    // 利用規約
    terms: {
        title: '利用規約',
        lastUpdated: '最終更新日',
        article: '第',
        clause: '条'
    },
    
    // 言語設定
    language: {
        title: '言語設定',
        select: '言語を選択',
        japanese: '日本語',
        english: 'English',
        chinese: '中文',
        korean: '한국어',
        current: '現在の言語',
        languageChanged: '言語を変更しました。ページをリロードしてください。'
    },
    
    // アカウント削除
    deleteAccount: {
        title: 'アカウント削除',
        warning: '警告',
        warningText: 'アカウントを削除すると、以下のデータがすべて削除されます：',
        dataList: [
            'プロフィール情報',
            '体重記録',
            '食事記録（写真を含む）',
            '運動記録',
            '目標設定',
            'AI相談履歴',
            '通知設定'
        ],
        cannotUndo: 'この操作は取り消すことができません。',
        confirmation: 'アカウント削除の確認',
        enterPassword: 'アカウントを削除するには、パスワードを入力してください。',
        confirmCheckbox: 'すべてのデータが削除されることを理解しました',
        deleteButton: 'アカウントを削除する',
        finalConfirm: '本当にアカウントを削除しますか？この操作は取り消せません。',
        accountDeleted: 'アカウントを削除しました。ご利用ありがとうございました。'
    },
    
    // ログイン
    login: {
        title: 'ログイン',
        email: 'メールアドレス',
        password: 'パスワード',
        loginButton: 'ログイン',
        noAccount: 'アカウントをお持ちでない方',
        register: '新規登録'
    },
    
    // 新規登録
    register: {
        title: '新規登録',
        name: '名前',
        email: 'メールアドレス',
        password: 'パスワード',
        gender: '性別',
        birthDate: '生年月日',
        male: '男性',
        female: '女性',
        other: 'その他',
        registerButton: '登録',
        hasAccount: 'すでにアカウントをお持ちの方',
        login: 'ログイン'
    }
};