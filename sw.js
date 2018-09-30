/**
 * Service Worker のインストール
 */

// キャッシュ名 (好きな名前)
var CACHE_NAME = 'my-site-cache-v1';

// Service Worker の管理対象
//    ※ 存在しないファイルを指定すると Uncaught (in promise) TypeError: Request failed エラーが出るので注意
var urlsToCache = [
  '/service-worker-test/',
  '/service-worker-test/styles/main.css',
  '/service-worker-test/script/main.js'
];


self.addEventListener('install', function(event) {
  // インストール処理
  //   1. キャッシュを開く
  //   2. ファイルをキャッシュさせる
  //   3. 必要なアセットがすべてキャッシュされたかを確認する
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        // return cache.addAll(urlsToCache); // 動くがエラーが出たので下行に変更
        return cache.addAll(urlsToCache.map(url => new Request(url, {credentials: 'same-origin'}))); // https://kenjimorita.jp/amp_pwa_serviceworker_cache_401-unauthorized/
      })
  );
});




/**
 * リクエストをキャッシュして返す
 *     キャッシュさせたレスポンスを返す
 *     Service Worker がインストールされた状態で、他のページヘ移動したりページを更新したりすると、Service Worker は fetch イベントを受け取る
 */
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request) // リクエストを見て、Service Worker が生成したキャッシュの中に該当するものがあるかを探す
      .then(function(response) {
        // キャッシュがあったのでそのレスポンスを返す
        if (response) {
          return response;
        }
        // キャッシュがない場合はコール結果を fetch() に渡し、ネットワークリクエストが発生させ結果を得る
        return fetch(event.request); // fetch は Cookie などのクレデンシャルをリクエストに含めない。第２引数に `{credentials: 'include'}` で含めることができる
      }
    )
  );
});

// // 新しいリクエストを逐次キャッシュさせたい場合
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         // キャッシュがあったのでレスポンスを返す
//         if (response) {
//           return response;
//         }

//         // 重要：リクエストを clone する。リクエストは Stream なので
//         // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
//         // 必要なので、リクエストは clone しないといけない
//         var fetchRequest = event.request.clone();

//         return fetch(fetchRequest).then(
//           function(response) {
//             // レスポンスが正しいかをチェック
//             if(!response || response.status !== 200 || response.type !== 'basic') {
//               return response;
//             }

//             // 重要：レスポンスを clone する。レスポンスは Stream で
//             // ブラウザ用とキャッシュ用の2回必要。なので clone して
//             // 2つの Stream があるようにする
//             var responseToCache = response.clone();

//             caches.open(CACHE_NAME)
//               .then(function(cache) {
//                 cache.put(event.request, responseToCache);
//               });

//             return response;
//           }
//         );
//       })
//     );
// });




/**
 * Service Worker の更新
 *     コールバックでキャッシュの管理が必要
 */
// Service Worker 中のキャッシュすべてをループ処理し、ホワイトリストにないものを削除するサンプル
//   キャッシュ名 my-site-cache-v1 → pages-cache-v1 と blog-posts-cache-v1
self.addEventListener('activate', function(event) {

  var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1']; // ホワイトリスト。これ以外はアクティベーション時に削除

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
