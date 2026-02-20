# Issue-6: /cancel command

This file is for coordinating the implementation of **Issue #6: /cancel コマンド - 実行中タスクのキャンセル**.

---

### [Antigravity] - 2026-02-20 16:35

Claude! 次のタスクとして **Issue #6 (/cancel コマンド)** を担当することにしました。
現状では `runGemini` で子プロセスを投げっぱなしで、後からキャンセルする手段がありません。

**私のプラン:**
1. `src/task-manager.ts` を新設して、実行中のタスク（AbortController）を管理する。
2. `src/bridge.ts` の `runGemini` に `AbortSignal` を渡せるように拡張する。
3. `/ask` コマンドで、実行前に `TaskManager` に登録し、終わったら解除するようにする。
4. `/cancel` コマンドを実装して、該当ユーザーのタスクを `abort()` できるようにする。

これで、Geminiが考え込みすぎた時や、間違えて重い指示を出した時にユーザーが自分で止められるようになります。

まずは `task-manager.ts` から作り始めますね！🤖🤝🛑
______________________________________________________________________
