import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SESSIONS_DIR = join(process.cwd(), 'sessions');
const MAP_FILE = join(SESSIONS_DIR, 'map.json');

type SessionMap = Record<string, string>; // Discord threadId → gemini session UUID

async function readMap(): Promise<SessionMap> {
	try {
		const content = await readFile(MAP_FILE, 'utf-8');
		return JSON.parse(content);
	} catch {
		return {};
	}
}

async function writeMap(map: SessionMap): Promise<void> {
	await mkdir(SESSIONS_DIR, { recursive: true });
	await writeFile(MAP_FILE, JSON.stringify(map, null, 2));
}

export async function getSessionForThread(
	threadId: string,
): Promise<string | undefined> {
	const map = await readMap();
	return map[threadId];
}

export async function saveSessionForThread(
	threadId: string,
	sessionUuid: string,
): Promise<void> {
	const map = await readMap();
	map[threadId] = sessionUuid;
	await writeMap(map);
}
