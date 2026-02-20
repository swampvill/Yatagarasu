import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

const ALLOWED_EXTENSIONS = new Set([
	'.txt',
	'.md',
	'.log',
	'.ts',
	'.js',
	'.mjs',
	'.cjs',
	'.py',
	'.rb',
	'.go',
	'.rs',
	'.java',
	'.c',
	'.cpp',
	'.h',
	'.json',
	'.yaml',
	'.yml',
	'.toml',
	'.env',
	'.sh',
	'.bash',
	'.zsh',
	'.fish',
	'.html',
	'.css',
	'.sql',
	'.graphql',
	'.csv',
	'.xml',
]);

const MAX_FILE_SIZE = 100 * 1024; // 100KB

export interface UploadResult {
	dir: string;
	filename: string;
}

export function isAllowedFile(filename: string, contentType: string): boolean {
	const ext = `.${filename.split('.').pop()?.toLowerCase() ?? ''}`;
	if (!ALLOWED_EXTENSIONS.has(ext)) return false;
	if (
		contentType.startsWith('image/') ||
		contentType.startsWith('video/') ||
		contentType.startsWith('audio/')
	)
		return false;
	return true;
}

export async function saveAttachment(
	interactionId: string,
	filename: string,
	url: string,
	size: number,
): Promise<UploadResult> {
	if (size > MAX_FILE_SIZE) {
		throw new Error(
			`ファイルサイズが大きすぎます（上限 100KB、実際: ${Math.ceil(size / 1024)}KB）`,
		);
	}

	const res = await fetch(url);
	if (!res.ok)
		throw new Error(`ファイルのダウンロードに失敗しました: ${res.status}`);

	const buffer = await res.arrayBuffer();
	const dir = join(UPLOADS_DIR, interactionId);
	await mkdir(dir, { recursive: true });
	await writeFile(join(dir, filename), Buffer.from(buffer));

	return { dir, filename };
}

export async function cleanupUpload(interactionId: string): Promise<void> {
	await rm(join(UPLOADS_DIR, interactionId), { recursive: true, force: true });
}
