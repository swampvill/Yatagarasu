# Yatagarasu 🐦‍⬛🌉

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

`.env` を編集して以下を設定してください:

| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `DISCORD_TOKEN` | ✅ | Bot トークン |
| `DISCORD_CLIENT_ID` | ✅ | アプリケーション ID |
| `GUILD_ID` | | ギルドID（省略時はグローバル登録） |
| `GEMINI_CLI_PATH` | | gemini CLI パス（デフォルト: `/usr/local/bin/gemini`） |
| `DEFAULT_MODEL` | | デフォルトモデル名 |

### 3. インストール & 起動

```bash
npm install
npm run deploy-commands  # コマンドを Discord に登録
npm run dev              # 開発モードで起動
```

## コマンド

| コマンド | 説明 |
| --- | --- |
| `/ask <指示>` | Antigravity に指示を送る |
| `/ask <指示> file:<添付>` | ファイルを渡して指示を送る |
| `/models` | AI モデルの一覧表示・切替 |
| `/status` | Bot と Antigravity の状態確認 |

### `/ask` オプション

| オプション | 説明 |
| --- | --- |
| `prompt` | 実行したい指示（必須） |
| `file` | 参照させるファイル（テキスト系、最大 100KB） |
| `yolo` | 自動承認モード（確認なしで実行） |
| `dir` | 作業ディレクトリ |

### 会話の継続

Discord の **スレッド内** で `/ask` を使うと、前回の会話コンテキストが自動的に引き継がれます。

```
1. チャンネルで /ask → 結果が返る
2. その返信からスレッドを作成
3. スレッド内で /ask → 前の会話を踏まえて回答
```

## アーキテクチャ

```
Discord → Yatagarasu → gemini CLI → ローカル実行 → Embed で結果表示
```

スレッド内では `sessions/map.json` でセッション ID を管理し、gemini CLI の `--resume` オプションで会話を継続します。
ファイル添付は `uploads/` に一時保存して実行後に削除します。

<!-- This is a comment added by Gemini CLI -->
