# TODO（ユーザー作業）

## 🔑 Discord Bot の作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」をクリック → 名前を `antigravity-bridge` に設定
3. 左メニュー「Bot」→「Reset Token」→ トークンをコピー
4. 左メニュー「OAuth2」→「Client ID」をコピー
5. Bot の招待URL を生成:
   - 左メニュー「OAuth2」→「URL Generator」
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
6. 生成された URL をブラウザで開き、対象のサーバーに Bot を招待

## ⚙️ 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集:

```
DISCORD_TOKEN=<手順3でコピーしたトークン>
DISCORD_CLIENT_ID=<手順4でコピーしたクライアントID>
GUILD_ID=<Botを招待したサーバーのID>
```

> **サーバーIDの取得方法**: Discord の設定 → 詳細設定 → 「開発者モード」をON → サーバー名を右クリック → 「IDをコピー」

## 🚀 起動

```bash
npm run deploy-commands  # コマンドを Discord に登録（初回のみ）
npm run dev              # 開発モードで起動
```

## 📦 GitHub リポジトリの作成（任意）

```bash
gh repo create swampvill/antigravity-bridge --private --source=. --push
```
