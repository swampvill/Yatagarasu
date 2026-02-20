# AI Agent 開発ガイドライン

このドキュメントは、Claude Code や他の AI エージェントがこのリポジトリで作業する際のルールを定義する。

## ブランチ戦略

### ブランチ命名規則

```
<type>/<short-description>
```

| Type       | 用途               |
| ---------- | ------------------ |
| `feat`     | 新機能             |
| `fix`      | バグ修正           |
| `docs`     | ドキュメント       |
| `refactor` | リファクタリング   |
| `test`     | テスト追加・修正   |
| `chore`    | 設定・依存関係など |

例:
- `feat/add-workspace-command`
- `fix/bridge-timeout-error`
- `docs/setup-guide`

### 作業フロー

1. `main` から新しいブランチを作成
2. 変更をコミット
3. PR を作成
4. レビュー後にマージ

```bash
git checkout main
git pull origin main
git checkout -b feat/new-feature
# ... 作業 ...
git add <files>
git commit -m "Add new feature"
git push -u origin feat/new-feature
gh pr create
```

## コミットメッセージ

### フォーマット

```
<type>: <subject>

<body (optional)>

Co-Authored-By: <agent-name> <email>
```

### Type 一覧

| Type       | 説明                               |
| ---------- | ---------------------------------- |
| `feat`     | 新機能                             |
| `fix`      | バグ修正                           |
| `docs`     | ドキュメント変更                   |
| `style`    | フォーマット変更（動作に影響なし） |
| `refactor` | リファクタリング                   |
| `test`     | テスト追加・修正                   |
| `chore`    | ビルド・設定変更                   |

### 例

```
feat: Add /workspaces command to list projects

Co-Authored-By: Antigravity <noreply@google.com>
```

## コーディング規約

### TypeScript

- 厳密な型定義を使用（`any` は避ける）
- `interface` を `type` より優先
- 非同期処理は `async/await` を使用
- エラーは適切に catch してログ出力

### ファイル構成

```
src/
├── index.ts            # エントリーポイント（Bot 本体）
├── bridge.ts           # gemini CLI ラッパー
├── deploy-commands.ts  # スラッシュコマンド登録
├── commands/           # スラッシュコマンド定義
│   ├── ask.ts          # /ask コマンド
│   └── models.ts       # /models コマンド
└── ui/                 # UI コンポーネント
    └── embeds.ts       # Discord Embed ビルダー
```

### 新機能追加時のチェックリスト

- [ ] 型定義を適切に追加
- [ ] ビジネスロジックを `src/` 内の適切なモジュールに分離
- [ ] スラッシュコマンドを `deploy-commands.ts` に追加
- [ ] ハンドラーを `index.ts` に追加
- [ ] `npx tsc --noEmit` でコンパイルエラーがないことを確認

## AI エージェント向け指示

### 作業開始前

1. `git status` で現在の状態を確認
2. `main` ブランチが最新か確認
3. 適切な名前でブランチを作成

### コード変更時

1. 既存のコードスタイルに従う
2. 過度な抽象化を避ける
3. 不要なコメントやドキュメントを追加しない
4. 変更は最小限に留める

### PR 作成時

1. タイトルは簡潔に（70文字以内）
2. 概要で変更内容を説明
3. テスト手順を記載

### やってはいけないこと

- `main` ブランチに直接 push
- `.env` をコミット
- `--force` push（明示的な指示がない限り）
- 依頼されていない「改善」や「リファクタリング」

### 環境情報

| 項目             | 値                                   |
| ---------------- | ------------------------------------ |
| Node.js          | 18+                                  |
| Package Manager  | npm                                  |
| 言語             | TypeScript                           |
| Discord.js       | v14                                  |
| Linter/Formatter | Biome                                |
| ブリッジ先       | gemini CLI (`/usr/local/bin/gemini`) |
