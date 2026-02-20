import { spawn } from 'node:child_process';

export interface BridgeOptions {
	prompt: string;
	model?: string;
	workingDir?: string;
	yolo?: boolean;
	outputFormat?: 'text' | 'json' | 'stream-json';
	timeout?: number;
	sessionId?: string;
}

export interface BridgeResult {
	stdout: string;
	stderr: string;
	exitCode: number | null;
	timedOut: boolean;
	sessionId?: string;
	text?: string; // JSON形式のとき parsed.response を格納
}

const DEFAULT_TIMEOUT = 120_000; // 2分

export function getGeminiCliPath(): string {
	return process.env.GEMINI_CLI_PATH || '/usr/local/bin/gemini';
}

export function getDefaultModel(): string {
	return process.env.DEFAULT_MODEL || '';
}

/**
 * gemini CLI を子プロセスとして実行し、結果を返す
 */
export async function runGemini(options: BridgeOptions): Promise<BridgeResult> {
	const cliPath = getGeminiCliPath();
	const args: string[] = [];

	// プロンプト
	args.push('-p', options.prompt);

	// モデル指定
	const model = options.model || getDefaultModel();
	if (model) {
		args.push('-m', model);
	}

	// セッション再開
	if (options.sessionId) {
		args.push('--resume', options.sessionId);
	}

	// 出力形式
	args.push('-o', options.outputFormat || 'text');

	// 自動承認モード
	if (options.yolo) {
		args.push('-y');
	}

	const timeout = options.timeout || DEFAULT_TIMEOUT;

	return new Promise((resolve) => {
		const child = spawn(cliPath, args, {
			cwd: options.workingDir || process.cwd(),
			env: { ...process.env },
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		let stdout = '';
		let stderr = '';
		let timedOut = false;

		const timer = setTimeout(() => {
			timedOut = true;
			child.kill('SIGTERM');
		}, timeout);

		child.stdout.on('data', (data: Buffer) => {
			stdout += data.toString();
		});

		child.stderr.on('data', (data: Buffer) => {
			stderr += data.toString();
		});

		child.on('close', (code) => {
			clearTimeout(timer);

			let sessionId: string | undefined;
			let text: string | undefined;
			if (options.outputFormat === 'json' && stdout) {
				try {
					const parsed = JSON.parse(stdout);
					sessionId = parsed.session_id;
					text = parsed.response;
				} catch (e) {
					console.error('Failed to parse JSON output from gemini CLI:', e);
				}
			}

			resolve({ stdout, stderr, exitCode: code, timedOut, sessionId, text });
		});

		child.on('error', (err) => {
			clearTimeout(timer);
			resolve({
				stdout: '',
				stderr: err.message,
				exitCode: 1,
				timedOut: false,
			});
		});
	});
}

/**
 * gemini CLI のバージョンを取得する
 */
export async function getGeminiVersion(): Promise<string> {
	const cliPath = getGeminiCliPath();
	return new Promise((resolve) => {
		const child = spawn(cliPath, ['--version'], {
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		let out = '';
		child.stdout.on('data', (d: Buffer) => {
			out += d.toString();
		});
		child.on('close', () => resolve(out.trim() || 'unknown'));
		child.on('error', () => resolve('unknown'));
	});
}

/**
 * 利用可能なモデルの情報（将来的に gemini CLI から取得）
 */
export interface ModelInfo {
	name: string;
	displayName: string;
	isActive: boolean;
}

let currentModel = '';

export function getCurrentModel(): string {
	return currentModel || getDefaultModel();
}

export function setCurrentModel(model: string): void {
	currentModel = model;
}

/**
 * 登録済みのモデル一覧を返す（設定ファイルから読み取る拡張も可能）
 */
export function getAvailableModels(): ModelInfo[] {
	const active = getCurrentModel();
	const models = [
		{ name: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro' },
		{ name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash' },
		{ name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
	];

	return models.map((m) => ({
		...m,
		isActive: m.name === active,
	}));
}
