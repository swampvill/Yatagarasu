import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import { taskManager } from '../task-manager.js';

export const data = new SlashCommandBuilder()
	.setName('cancel')
	.setDescription('現在実行中の指示をキャンセルする');

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	const userId = interaction.user.id;

	if (taskManager.hasTask(userId)) {
		taskManager.cancelTask(userId);
		await interaction.reply({
			content: '🛑 実行中のタスクをキャンセルしました。',
			ephemeral: true,
		});
	} else {
		await interaction.reply({
			content: '❓ 現在実行中のタスクはありません。',
			ephemeral: true,
		});
	}
}
