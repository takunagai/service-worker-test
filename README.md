# service-worker-test

[Service Worker の紹介 - Google Developers](https://developers.google.com/web/fundamentals/primers/service-workers/?hl=ja) の通りにした。

## メモ

* Service Worker は JavaScript Worker のひとつ。DOM に直接アクセスできない。DOM操作はコントロールするページ経由（postMessage インターフェースから送られるメッセージに返信することで通信）で行う。
* Service Worker はプログラム可能なネットワークプロキシ。ページからのネットワークリクエストをコントロールできる。
* Service Worker は使用されていない間は終了、必要な時に起動。onfetch、onmessage ハンドラ内でグローバルに設定したステートに依存できない。持続的で再利用可能なデータを Service Worker のライフサイクル間で共有したい場合は、IndexedDB API API にアクセスしなければならない。
* Service Worker は JavaScript の Promises を多用する。Promises についてよく知ること。
* Service Worker を Web ページにインストールするには、ページの JavaScript から登録。登録するとブラウザは Service Worker のインストール処理をバックグラウンドで実行する
* Service Worker のインストールは、「必要なすべてのファイル」をキャッシュさせること。キャッシュに失敗したら再トライする
* インストールが完了したら、アクティベーション処理が続く。古いキャッシュの処理など Service Worker の更新に必要
* アクティベーションできたら、Service Worker はそのスコープ内のすべてのページをコントロールする。
* Service Worker を登録したページ自身のみ登録時点でコントロールされない。次に読み込まれた際からコントロールされる
* Service Worker が管理中、その状態は2つしかない
  - 1. メモリ節約のため Service Worker が終了
  - 2. ページで起こったネットワークリクエスト or メッセージに対して fetch か message イベントの処理を行おうとしている
* Service Worker が有効になっているかは、Chromeなら chrome://inspect/#service-workers, chrome://inspect/#service-workers で確認できる
* Service Worker のテストは、ウインドウを閉じて開き直すと登録やキャッシュを消えるシークレットウインドウで行うと良い
