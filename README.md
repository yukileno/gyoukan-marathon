# 業間マラソンの足跡

学校の業間休みに走った周回を記録し、コインで3Dの猫を育てるブラウザゲームです。周回、コイン、猫、家具の配置は開いたサイトのブラウザ内に保存されます。サイトのURLが変わると、ブラウザの保存領域も変わります。

## 開発

`dist/` を静的HTTPサーバーで配信してください。`src/room.js` は3Dの部屋のソースです。Three.js 0.187.0 と esbuild 0.28.2 で `dist/room3d.js` にバンドルしています。

GitHub Actionsは `main` の `dist/` をGitHub Pagesに公開します。

家具のモデルと画像は [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit) のCC0素材です。同梱の利用条件は `dist/furniture/License.txt` にあります。エサと床の画像はChatGPTの画像生成で作成しました。

子ねこから銀毛ねこまでのGLBとアニメーションは [Vuena Cute Pets & Wildlife FREE Sample](https://vuena.itch.io/blocky-pets-free) のCC0素材です。同梱の利用条件は `dist/models/LICENSE.txt` にあります。
