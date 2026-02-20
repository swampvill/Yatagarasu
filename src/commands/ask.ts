import {
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';
import { getCurrentModel, runGemini } from '../bridge.js';
import { buildResultEmbed, buildThinkingEmbed } from '../ui/embeds.js';

export const data = new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Antigravity に指示を送る')
    .addStringOption((option) =>
        option
            .setName('prompt')
            .setDescription('実行したい指示を入力')
            .setRequired(true),
    )
    .addBooleanOption((option) =>
        option
            .setName('yolo')
            .setDescription('自動承認モード（確認なしで実行）')
            .setRequired(false),
    )
    .addStringOption((option) =>
        option
            .setName('dir')
            .setDescription('作業ディレクトリ')
            .setRequired(false),
    );

export async function execute(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    const prompt = interaction.options.getString('prompt', true);
    const yolo = interaction.options.getBoolean('yolo') ?? false;
    const workingDir = interaction.options.getString('dir') ?? undefined;

    // 「考え中」の Embed を表示
    const thinkingEmbed = buildThinkingEmbed(prompt);
    await interaction.reply({ embeds: [thinkingEmbed] });

    // gemini CLI を実行
    const result = await runGemini({
        prompt,
        model: getCurrentModel(),
        workingDir,
        yolo,
        outputFormat: 'text',
    });

    // 結果を Embed に変換して更新
    const resultEmbed = buildResultEmbed(prompt, result);
    await interaction.editReply({ embeds: [resultEmbed] });
}
