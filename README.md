# antigravity-bridge 🌉

Discord と Antigravity を繋ぐ「伝令ボット」。  
スマホの Discord アプリからスラッシュコマンドを送ると、ローカルPC上の Antigravity（gemini CLI）が起動してタスクを実行し、結果を Embed で返します。

## セットアップ

### 1. Discord Bot の作成

[Discord Developer Portal](https://discord.com/developers/applications) で新しいアプリケーションを作成し、Bot を有効化してトークンを取得してください。

**必要な権限:**
- `applications.commands`（スラッシュコマンド）
- `bot`

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集して、Bot のトークンとクライアントIDを設定してください。

### 3. インストール & 起動

```bash
npm install
npm run deploy-commands  # コマンドを Discord に登録
npm run dev              # 開発モードで起動
```

## コマンド

| コマンド      | 説明                     |
| ------------- | ------------------------ |
| `/ask <指示>` | Antigravity に指示を送る |
| `/models`     | AIモデルの一覧表示・切替 |

## アーキテクチャ

```
Discord → antigravity-bridge → gemini CLI → ローカル実行 → Embed で結果表示
```
