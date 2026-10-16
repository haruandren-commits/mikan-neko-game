# みかんから出るニャ！

9個のみかんから顔を出す猫をタップして押し戻す、縦画面向けのブラウザゲームです。

## 遊び方

「あそぶ！」を押して、顔を出した猫をタップ。30秒経過、または3匹逃げると終了します。3コンボごとに加点が増え、10秒ごとに猫の出現間隔と待ち時間が短くなります。空振りにペナルティはありません。

右上で音をONにできます。音声は端末操作後に生成します。端末の設定によっては聞こえない場合がありますが、消音でも遊べます。別のアプリやタブに移動すると自動で一時停止し、「つづける」で再開します。最高スコアは利用中のブラウザに保存されます（保存不可でも遊べます）。

## ローカルで動かす

ビルド・外部ライブラリ・APIキーは不要です。

```sh
cd /workspace/mikan-neko-game
python3 -m http.server 8000 --bind 0.0.0.0
```

通常のPC開発環境ではブラウザで `http://localhost:8000` を開きます。停止は Ctrl+C。`index.html` 単体でも動きますが、公開確認はHTTPサーバーを使用してください。

## iPhoneからGitHub Pagesで公開する

リポジトリに `index.html` が保存された後、次の順番で操作します。

1. SafariでGitHubの `haruandren-commits/mikan-neko-game` を開きます。
2. リポジトリの **Settings** を開きます。見えない場合は右端のメニューを確認してください。
3. **Pages** を開きます。
4. **Build and deployment → Source** を **Deploy from a branch** にします。
5. **Branch** を **main**、フォルダーを **/ (root)** にして **Save** を押します。
6. デプロイ完了後、Pages画面の **Visit site** からゲームを開きます。

設定予定のURLは `https://haruandren-commits.github.io/mikan-neko-game/` です。公開完了まではアクセスできません。リポジトリの公開範囲やGitHubプランによりPagesの利用条件が異なります。

## 検証

`tests/smoke.cjs` はPlaywrightによる回帰確認です。Playwrightと対応ブラウザのある環境で、上記サーバーを起動して `node tests/smoke.cjs` を実行します。必要に応じて `NODE_PATH` にPlaywrightのインストール先を指定します。

公開前に実機のiPhone Safariでも、音のON/OFF、縦画面、連打、アプリ切替と再開、30秒終了、再挑戦を確認してください。自動テストのWebKitは実機Safariと完全には同じではありません。

## 素材

猫・みかんはCSSによるオリジナル描画、音声はWeb Audioによる合成です。外部画像・フォント・音源への通信はありません。公式キャラクター・既存作品の音楽や画像は使用していません。

### この環境での検証結果

Chromiumで、得点・連打による二重加点防止・一時停止・3回逃走による終了・30秒終了・ステージ進行・再挑戦・音ボタン・バックグラウンドでの一時停止・横幅320/375/390/430pxを確認しました。JavaScript実行エラーはありませんでした。

```sh
TEST_BROWSERS=chromium CHROMIUM_PATH=/usr/bin/chromium node tests/smoke.cjs
```

WebKitのダウンロードはネットワーク側の403応答で実行できていません。実機iPhone Safariでの操作と音声の最終確認、GitHubへの反映、Pagesでの公開は未実施です。

## 元のコードの保存

添付された改良前のHTMLは `originals/mikan_neko_game.html` に、そのまま保存しています。公開するゲームはルートの `index.html` です。Gitの履歴でも変更を確認できます。
