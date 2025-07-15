
# TriPlan - 旅程管理アプリ

TriPlanは、AIが旅の計画をサポートする、シンプルで使いやすい旅程管理ウェブアプリケーションです。直感的な操作で旅行プランを作成・管理し、友人や家族と簡単に共有できます。

![TriPlan Screenshot](https://storage.googleapis.com/gemini-codelab-images/triplan_screenshot.png)

## ✨ 主な機能

- **旅行プランの作成・管理:** タイトル、目的地、期間を設定して、簡単に新しい旅行プランを作成。
- **日ごとの旅程管理:** 旅行期間中の各日の予定を時間、タイトル、メモ、予約リンクと共に管理。
- **AIによる旅程提案:** 目的地と興味・関心を入力するだけで、Gemini APIが最適な観光スポットやアクティビティを提案。
- **フリーメモ機能:** 日付に縛られない持ち物リストや予約番号などを自由に記録できるメモタブ。
- **簡単共有:** 生成されたURLを使って、閲覧専用の旅程を友人や家族と簡単に共有。
- **色分けされたUI:** 各旅行プランが自動で色分けされ、視覚的に管理しやすいデザイン。
- **ローカルストレージ保存:** 作成したデータはブラウザのローカルストレージに保存されるため、サーバーは不要です。

## 🛠️ 技術スタック

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **AI:** Google Gemini API (`@google/genai`)
- **Utilities:** `pako` (共有URLのためのデータ圧縮)
- **Runtime:** Browser with ES Modules (via `esm.sh`)

## 🚀 実行方法

### 前提条件

AIによる旅程提案機能を利用するには、Google AIのAPIキーが必要です。以下のサイトから無料で取得できます。

- [Google AI for Developers](https://ai.google.dev/)

### セットアップ手順

このプロジェクトはビルドステップなしで動作します。

1. **リポジトリをダウンロードまたはクローンします。**

2. **APIキーの設定**

    `index.html` ファイルを開き、`<head>` タグ内に以下のスクリプトを追加します。`"YOUR_GEMINI_API_KEY"` の部分をあなたの実際のAPIキーに置き換えてください。

    ```html
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>TriPlan</title>
      
      <!-- ▼▼▼ このスクリプトを追加して、あなたのAPIキーを設定 ▼▼▼ -->
      <script>
        window.process = {
          env: {
            API_KEY: "YOUR_GEMINI_API_KEY"
          }
        };
      </script>
      <!-- ▲▲▲ ここまで ▲▲▲ -->
      
      <script src="https://cdn.tailwindcss.com"></script>
      <script type="importmap">
      ...
    </head>
    ```

    **⚠️ 注意:** この方法は開発デモ用です。APIキーをクライアントサイドのコードに直接埋め込むことは、セキュリティ上のリスクを伴います。本番環境で利用する場合は、サーバーサイドでAPIキーを管理するなどの対策を強く推奨します。

3. **ローカルサーバーで開く**

    CORS (Cross-Origin Resource Sharing) の問題を避けるため、ローカルウェブサーバーを起動して `index.html` にアクセスする必要があります。

    エディタにVS Codeを使用している場合、[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 拡張機能を利用するのが最も簡単です。

    または、お使いの環境にPythonがインストールされていれば、プロジェクトのルートディレクトリで以下のコマンドを実行して簡易サーバーを起動できます。
    ```bash
    # Python 3 の場合
    python -m http.server
    ```
    
4. **ブラウザで確認**

    ブラウザで `http://localhost:8000` (またはLive Serverが指定したポート) を開くと、アプリケーションが表示されます。

## 📁 ファイル構成

```
.
├── components/             # Reactコンポーネント
│   ├── common/             # 共通コンポーネント (Header, Icons, etc.)
│   ├── ItineraryView.tsx   # 旅程詳細ビュー
│   └── TripView.tsx        # 旅行一覧ビュー
├── services/               # 外部サービスとの連携 (Gemini API)
│   └── geminiService.ts
├── utils.ts                # ユーティリティ関数
├── App.tsx                 # アプリケーションのメインコンポーネント
├── index.html              # エントリーポイントのHTMLファイル
├── index.tsx               # Reactのルート
├── metadata.json           # アプリのメタデータ
└── types.ts                # TypeScriptの型定義
```
