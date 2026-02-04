const ko = {
    // ナビゲーション
    nav: {
        home: '홈',
        record: '체중 기록',
        meal: '식사 기록',
        exercise: '운동 기록',
        healthMemo: '건강 메모',
        calendar: '캘린더',
        graph: '그래프',
        goal: '목표 설정',
        ai: 'AI 상담',
        profile: '프로필',
        notification: '알림 설정',
        settings: '설정',
        help: '도움말',
        terms: '이용약관',
        language: '언어 설정',
        logout: '로그아웃',
        deleteAccount: '계정 삭제',
        menu: '메뉴'
    },
    
    // 共通
    common: {
        save: '저장',
        cancel: '취소',
        delete: '삭제',
        edit: '편집',
        close: '닫기',
        loading: '로딩 중...',
        noData: '데이터가 없습니다',
        backToHome: '홈으로 돌아가기',
        required: '필수',
        optional: '선택'
    },
    
    // ホーム
    home: {
        title: '홈',
        welcome: '환영합니다',
        todayRecord: '오늘의 기록',
        weightProgress: '체중 변화',
        goalProgress: '목표 진행',
        recentRecords: '최근 기록',
        addRecord: '기록 추가',
        setGoal: '목표 설정',
        statistics: '통계',
        average: '평균',
        highest: '최고',
        lowest: '최저',
        noRecordYet: '아직 기록이 없습니다',
        noGoalSet: '목표가 설정되지 않았습니다'
    },
    
    // 体重記録
    record: {
        title: '체중 기록',
        weight: '체중',
        bodyFat: '체지방률',
        memo: '메모',
        date: '날짜',
        saveRecord: '기록 저장',
        weightPlaceholder: '예: 70.5',
        bodyFatPlaceholder: '예: 20.5',
        memoPlaceholder: '메모 입력',
        recordSaved: '체중 기록이 저장되었습니다'
    },
    
    // 食事記録
    meal: {
        title: '식사 기록',
        recordMeal: '식사 기록하기',
        mealType: '식사 유형',
        mealName: '식사명',
        calories: '칼로리',
        protein: '단백질',
        carbs: '탄수화물',
        fat: '지방',
        photo: '사진',
        time: '시간',
        breakfast: '아침',
        lunch: '점심',
        dinner: '저녁',
        snack: '간식',
        todayMeals: '오늘의 식사',
        todayTotal: '오늘의 합계',
        recentMeals: '최근 식사 기록',
        mealSaved: '식사 기록이 저장되었습니다'
    },
    
    // 運動記録
    exercise: {
        title: '운동 기록',
        recordExercise: '운동 기록하기',
        exerciseType: '운동 유형',
        exerciseName: '운동명',
        duration: '시간(분)',
        caloriesBurned: '소모 칼로리',
        distance: '거리',
        running: '달리기',
        walking: '걷기',
        cycling: '자전거',
        swimming: '수영',
        gym: '헬스장',
        yoga: '요가',
        other: '기타',
        todayExercises: '오늘의 운동',
        recentExercises: '최근 운동 기록',
        exerciseSaved: '운동 기록이 저장되었습니다'
    },
    
    // 体調メモ
    healthMemo: {
        title: '건강 메모',
        recordHealth: '오늘의 건강 기록하기',
        conditionRating: '컨디션 평가',
        sleepHours: '수면 시간',
        stressLevel: '스트레스 레벨',
        veryGood: '매우 좋음',
        good: '좋음',
        normal: '보통',
        bad: '나쁨',
        veryBad: '매우 나쁨',
        veryHigh: '매우 높음',
        high: '높음',
        low: '낮음',
        veryLow: '매우 낮음',
        recentMemos: '최근 건강 메모',
        memoSaved: '건강 메모가 저장되었습니다'
    },
    
    // カレンダー
    calendar: {
        title: '기록 캘린더',
        prevMonth: '이전',
        nextMonth: '다음',
        recordDays: '기록 일수',
        mealCount: '식사 기록',
        exerciseCount: '운동 기록',
        sunday: '일',
        monday: '월',
        tuesday: '화',
        wednesday: '수',
        thursday: '목',
        friday: '금',
        saturday: '토'
    },
    
    // グラフ
    graph: {
        title: '그래프',
        weightGraph: '체중 변화 그래프',
        period: '기간',
        week: '1주',
        month: '1개월',
        threeMonths: '3개월',
        sixMonths: '6개월',
        year: '1년'
    },
    
    // 目標設定
    goal: {
        title: '목표 설정',
        setGoal: '목표 설정하기',
        currentWeight: '현재 체중',
        targetWeight: '목표 체중',
        startDate: '시작일',
        endDate: '종료일',
        progress: '진행',
        achieved: '달성',
        goalSaved: '목표가 저장되었습니다',
        activeGoal: '현재 목표'
    },
    
    // AI相談
    ai: {
        title: 'AI 상담',
        askQuestion: '질문 입력',
        send: '전송',
        conversationHistory: '대화 기록',
        placeholder: '체중 관리에 대해 질문하세요'
    },
    
    // プロフィール
    profile: {
        title: '프로필',
        basicInfo: '기본 정보',
        email: '이메일',
        name: '이름',
        gender: '성별',
        birthDate: '생년월일',
        male: '남성',
        female: '여성',
        registeredDate: '가입일',
        changePassword: '비밀번호 변경',
        currentPassword: '현재 비밀번호',
        newPassword: '새 비밀번호',
        confirmPassword: '비밀번호 확인',
        updateProfile: '프로필 업데이트',
        updatePassword: '비밀번호 변경',
        profileUpdated: '프로필이 업데이트되었습니다',
        passwordChanged: '비밀번호가 변경되었습니다',
        emailNote: '이메일은 변경할 수 없습니다',
        passwordNote: '최소 6자 이상'
    },
    
    // 通知設定
    notification: {
        title: '알림 설정',
        notificationSettings: '알림 설정',
        dailyReminder: '매일 리마인더',
        reminderTime: '알림 시간',
        goalAchievement: '목표 달성 알림',
        weeklyReport: '주간 리포트',
        browserNotification: '브라우저 알림',
        allowNotification: '알림 허용',
        testNotification: '테스트 전송',
        settingsSaved: '설정이 저장되었습니다',
        dailyReminderDesc: '설정된 시간에 매일 리마인더를 받습니다',
        goalAchievementDesc: '목표 달성 시 알림을 받습니다',
        weeklyReportDesc: '매주 월요일 주간 리포트를 받습니다',
        notificationGranted: '알림이 허용되었습니다',
        notificationDenied: '알림이 거부되었습니다',
        notificationDefault: '알림이 허용되지 않았습니다'
    },
    
    // ヘルプ
    help: {
        title: '도움말 및 FAQ',
        userGuide: '사용 가이드',
        faq: '자주 묻는 질문',
        howToRecord: '체중 기록하기',
        howToMeal: '식사 기록하기',
        howToExercise: '운동 기록하기',
        howToGoal: '목표 설정하기'
    },
    
    // 利用規約
    terms: {
        title: '이용약관',
        lastUpdated: '최종 업데이트',
        article: '제',
        clause: '조'
    },
    
    // 言語設定
    language: {
        title: '언어 설정',
        select: '언어 선택',
        japanese: '日本語',
        english: 'English',
        chinese: '中文',
        korean: '한국어',
        current: '현재 언어',
        languageChanged: '언어가 변경되었습니다. 페이지를 새로고침하세요.'
    },
    
    // アカウント削除
    deleteAccount: {
        title: '계정 삭제',
        warning: '경고',
        warningText: '계정을 삭제하면 다음 모든 데이터가 삭제됩니다:',
        dataList: [
            '프로필 정보',
            '체중 기록',
            '식사 기록(사진 포함)',
            '운동 기록',
            '목표 설정',
            'AI 상담 기록',
            '알림 설정'
        ],
        cannotUndo: '이 작업은 취소할 수 없습니다.',
        confirmation: '계정 삭제 확인',
        enterPassword: '계정을 삭제하려면 비밀번호를 입력하세요.',
        confirmCheckbox: '모든 데이터가 삭제됨을 이해했습니다',
        deleteButton: '계정 삭제',
        finalConfirm: '정말 계정을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
        accountDeleted: '계정이 삭제되었습니다. 서비스를 이용해 주셔서 감사합니다.'
    },
    
    // ログイン
    login: {
        title: '로그인',
        email: '이메일',
        password: '비밀번호',
        loginButton: '로그인',
        noAccount: '계정이 없으신가요?',
        register: '회원가입'
    },
    
    // 新規登録
    register: {
        title: '회원가입',
        name: '이름',
        email: '이메일',
        password: '비밀번호',
        gender: '성별',
        birthDate: '생년월일',
        male: '남성',
        female: '여성',
        other: '기타',
        registerButton: '가입',
        hasAccount: '이미 계정이 있으신가요?',
        login: '로그인'
    }
};