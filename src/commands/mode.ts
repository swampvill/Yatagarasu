import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import { getYoloMode, setYoloMode } from '../bridge.js';

export const data = new SlashCommandBuilder()
	.setName('mode')
	.setDescription('yolo モードのグローバル設定を切り替える');

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	const next = !getYoloMode();
	setYoloMode(next);

	await interaction.reply({
		content: next
			? '⚡ yolo モードが **ON** になりました。確認なしで実行します。'
			: '🔒 yolo モードが **OFF** になりました。確認が必要な操作では承認ボタンが表示されます。',
		ephemeral: true,
	});
}
