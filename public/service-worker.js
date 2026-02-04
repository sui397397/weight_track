const CACHE_NAME = 'weighttrack-v1';
const urlsToCache = [
  '/home.html',
  '/login.html',
  '/register.html',
  '/record.html',
  '/meal.html',
  '/exercise.html',
  '/calendar.html',
  '/graph.html',
  '/goal.html',
  '/profile.html',
  '/css/home.css',
  '/css/style.css',
  '/css/record.css',
  '/css/meal.css',
  '/css/exercise.css',
  '/css/calendar.css',
  '/css/graph.css',
  '/css/goal.css',
  '/js/common.js',
  '/js/auth.js',
  '/js/home.js',
  '/js/record.js',
  '/js/meal.js',
  '/js/exercise.js',
  '/js/calendar.js',
  '/js/graph.js',
  '/js/goal.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// インストール時
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// アクティベート時
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// フェッチ時（ネットワーク優先、フォールバックでキャッシュ）
self.addEventListener('fetch', (event) => {
  // POSTリクエストはキャッシュしない（エラー防止）
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // GETリクエストのみキャッシュに保存
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから取得
        return caches.match(event.request);
      })
  );
});