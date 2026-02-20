import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import {
	getCurrentModel,
	getGeminiCliPath,
	getGeminiVersion,
} from '../bridge.js';

const COLORS = { info: 0x5bc0eb } as const;

const startedAt = Date.now();

export const data = new SlashCommandBuilder()
	.setName('status')
	.setDescription('Bot と Antigravity の状態を確認する');

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	await interaction.deferReply({ ephemeral: true });

	const [geminiVersion] = await Promise.all([getGeminiVersion()]);

	const uptimeMs = Date.now() - startedAt;
	const uptimeStr = formatUptime(uptimeMs);

	const model = getCurrentModel() || '(デフォルト)';
	const cliPath = getGeminiCliPath();

	const embed = new EmbedBuilder()
		.setColor(COLORS.info)
		.setTitle('📊 Yatagarasu Status')
		.addFields(
			{ name: '🤖 現在のモデル', value: `\`${model}\``, inline: true },
			{ name: '⏱️ 稼働時間', value: uptimeStr, inline: true },
			{ name: '\u200b', value: '\u200b', inline: true },
			{ name: '🔧 gemini CLI', value: `\`${cliPath}\``, inline: true },
			{ name: '📦 バージョン', value: `\`${geminiVersion}\``, inline: true },
			{ name: '🟢 Node.js', value: `\`${process.version}\``, inline: true },
		)
		.setTimestamp();

	await interaction.editReply({ embeds: [embed] });
}

function formatUptime(ms: number): string {
	const s = Math.floor(ms / 1000);
	const m = Math.floor(s / 60);
	const h = Math.floor(m / 60);
	const d = Math.floor(h / 24);
	if (d > 0) return `${d}d ${h % 24}h`;
	if (h > 0) return `${h}h ${m % 60}m`;
	if (m > 0) return `${m}m ${s % 60}s`;
	return `${s}s`;
}
