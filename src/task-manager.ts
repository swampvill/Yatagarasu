export interface Task {
	userId: string;
	controller: AbortController;
	startTime: number;
}

class TaskManager {
	private static instance: TaskManager;
	private tasks: Map<string, Task> = new Map();

	private constructor() {}

	public static getInstance(): TaskManager {
		if (!TaskManager.instance) {
			TaskManager.instance = new TaskManager();
		}
		return TaskManager.instance;
	}

	/**
	 * タスクを登録する
	 */
	public registerTask(userId: string): AbortSignal {
		// 既存のタスクがあればキャンセルする（1ユーザー1タスクの制限）
		this.cancelTask(userId);

		const controller = new AbortController();
		this.tasks.set(userId, {
			userId,
			controller,
			startTime: Date.now(),
		});

		return controller.signal;
	}

	/**
	 * タスクを解除する
	 */
	public unregisterTask(userId: string): void {
		this.tasks.delete(userId);
	}

	/**
	 * タスクをキャンセルする
	 */
	public cancelTask(userId: string): boolean {
		const task = this.tasks.get(userId);
		if (task) {
			task.controller.abort();
			this.tasks.delete(userId);
			return true;
		}
		return false;
	}

	/**
	 * 実行中のタスクがあるか確認する
	 */
	public hasTask(userId: string): boolean {
		return this.tasks.has(userId);
	}
}

export const taskManager = TaskManager.getInstance();
