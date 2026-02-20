import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import { getCurrentModel, runGemini } from '../bridge.js';
import { getSessionForThread, saveSessionForThread } from '../sessions.js';
import { buildResultEmbed, buildThinkingEmbed } from '../ui/embeds.js';
import { cleanupUpload, isAllowedFile, saveAttachment } from '../uploads.js';

export const data = new SlashCommandBuilder()
	.setName('ask')
	.setDescription('Antigravity に指示を送る')
	.addStringOption((option) =>
		option
			.setName('prompt')
			.setDescription('実行したい指示を入力')
			.setRequired(true),
	)
	.addAttachmentOption((option) =>
		option
			.setName('file')
			.setDescription('参照させるファイル（テキスト系, 最大100KB）')
			.setRequired(false),
	)
	.addBooleanOption((option) =>
		option
			.setName('yolo')
			.setDescription('自動承認モード（確認なしで実行）')
			.setRequired(false),
	)
	.addStringOption((option) =>
		option.setName('dir').setDescription('作業ディレクトリ').setRequired(false),
	);

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	const prompt = interaction.options.getString('prompt', true);
	const attachment = interaction.options.getAttachment('file');
	const yolo = interaction.options.getBoolean('yolo') ?? false;
	const workingDir = interaction.options.getString('dir') ?? undefined;

	// スレッド内かどうか確認してセッションを引き継ぐ
	const threadId = interaction.channel?.isThread()
		? interaction.channelId
		: undefined;
	const sessionId = threadId ? await getSessionForThread(threadId) : undefined;

	// ファイル添付のバリデーション
	if (attachment) {
		if (!isAllowedFile(attachment.name, attachment.contentType ?? '')) {
			await interaction.reply({
				content: `❌ \`${attachment.name}\` はサポートされていないファイル形式です。テキスト系ファイル（.txt, .md, .py など）のみ対応しています。`,
				ephemeral: true,
			});
			return;
		}
	}

	// 「考え中」の Embed を表示
	const thinkingEmbed = buildThinkingEmbed(prompt);
	await interaction.reply({ embeds: [thinkingEmbed] });

	// ファイルを一時保存して workingDir に設定
	let uploadDir: string | undefined;
	let finalPrompt = prompt;
	let finalWorkingDir = workingDir;

	if (attachment) {
		try {
			const upload = await saveAttachment(
				interaction.id,
				attachment.name,
				attachment.url,
				attachment.size,
			);
			uploadDir = upload.dir;
			finalWorkingDir = upload.dir;
			finalPrompt = `添付ファイル「${upload.filename}」を参照して、以下の指示を実行してください:\n${prompt}`;
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : 'ファイルの処理に失敗しました';
			await interaction.editReply({ content: `❌ ${msg}`, embeds: [] });
			return;
		}
	}

	// gemini CLI を実行（スレッド内では JSON 形式でセッション ID を取得）
	const useJson = threadId !== undefined;
	const result = await runGemini({
		prompt: finalPrompt,
		model: getCurrentModel(),
		workingDir: finalWorkingDir,
		yolo,
		sessionId,
		outputFormat: useJson ? 'json' : 'text',
	});

	// スレッド内で実行した場合、セッション ID を保存
	if (threadId && result.sessionId) {
		await saveSessionForThread(threadId, result.sessionId).catch((err) =>
			console.error('Failed to save session:', err),
		);
	}

	// 一時ファイルを削除
	if (uploadDir) {
		await cleanupUpload(interaction.id).catch((err) =>
			console.error('Failed to cleanup upload:', err),
		);
	}

	// JSON形式のときは parsed text を使う。それ以外は stdout をそのまま使う
	const displayResult = result.text
		? { ...result, stdout: result.text }
		: result;

	// 結果を Embed に変換して更新
	const resultEmbed = buildResultEmbed(finalPrompt, displayResult);
	await interaction.editReply({ embeds: [resultEmbed] });
}
