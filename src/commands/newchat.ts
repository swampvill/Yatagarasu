import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import { clearSessionForThread } from '../sessions.js';

export const data = new SlashCommandBuilder()
	.setName('newchat')
	.setDescription('現在のスレッドのセッションをリセットして新しい会話を開始する');

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	if (!interaction.channel?.isThread()) {
		await interaction.reply({
			content: '❌ このコマンドはスレッド内でのみ使用できます。',
			ephemeral: true,
		});
		return;
	}

	await clearSessionForThread(interaction.channelId);

	await interaction.reply({
		content: '🔄 セッションをリセットしました。新しい会話を開始します。',
		ephemeral: true,
	});
}
