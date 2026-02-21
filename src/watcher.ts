import { stat } from 'node:fs/promises';
import { AttachmentBuilder, type Client, type TextChannel } from 'discord.js';
import { watch } from 'chokidar';

const MAX_ATTACH_SIZE = 8 * 1024 * 1024; // 8MB

export function startFileWatcher(
	client: Client,
	channelId: string,
	dir: string,
): void {
	const watcher = watch(dir, {
		ignored: [/(^|[/\\])\../, /node_modules/],
		persistent: true,
		ignoreInitial: true,
	});

	const notify = async (
		event: 'add' | 'change',
		filePath: string,
	): Promise<void> => {
		try {
			const channel = await client.channels.fetch(channelId);
			if (!channel?.isTextBased() || channel.isDMBased()) return;

			const textChannel = channel as TextChannel;
			const label = event === 'add' ? '📄 ファイル追加' : '✏️ ファイル変更';

			let fileSize = 0;
			try {
				const stats = await stat(filePath);
				fileSize = stats.size;
			} catch {
				return;
			}

			if (fileSize <= MAX_ATTACH_SIZE) {
				const attachment = new AttachmentBuilder(filePath);
				await textChannel.send({
					content: `${label}: \`${filePath}\``,
					files: [attachment],
				});
			} else {
				const mb = (fileSize / 1024 / 1024).toFixed(1);
				await textChannel.send(
					`${label}: \`${filePath}\` (${mb} MB - 添付上限超過)`,
				);
			}
		} catch (err) {
			console.error('File watcher notify error:', err);
		}
	};

	watcher.on('add', (filePath) => {
		notify('add', filePath).catch((err) =>
			console.error('Watcher add error:', err),
		);
	});
	watcher.on('change', (filePath) => {
		notify('change', filePath).catch((err) =>
			console.error('Watcher change error:', err),
		);
	});

	console.log(`👁️ ファイル監視開始: ${dir}`);
}
