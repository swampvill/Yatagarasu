import {
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    type StringSelectMenuInteraction,
} from 'discord.js';
import {
    getAvailableModels,
    getCurrentModel,
    setCurrentModel,
} from '../bridge.js';
import { buildModelsEmbed } from '../ui/embeds.js';

export const data = new SlashCommandBuilder()
    .setName('models')
    .setDescription('AIモデルの一覧表示・切替');

export async function execute(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    const models = getAvailableModels();
    const embed = buildModelsEmbed(models);

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('model_select')
        .setPlaceholder('モデルを選択')
        .addOptions(
            models.map((m) => ({
                label: m.displayName,
                value: m.name,
                default: m.isActive,
                emoji: m.isActive ? '🟢' : '⚪',
            })),
        );

    const row =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu,
        );

    await interaction.reply({
        embeds: [embed],
        components: [row],
    });
}

/**
 * セレクトメニューのインタラクションハンドラ
 */
export async function handleModelSelect(
    interaction: StringSelectMenuInteraction,
): Promise<void> {
    const selectedModel = interaction.values[0];
    if (!selectedModel) return;

    setCurrentModel(selectedModel);

    const models = getAvailableModels();
    const embed = buildModelsEmbed(models);

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('model_select')
        .setPlaceholder('モデルを選択')
        .addOptions(
            models.map((m) => ({
                label: m.displayName,
                value: m.name,
                default: m.isActive,
                emoji: m.isActive ? '🟢' : '⚪',
            })),
        );

    const row =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu,
        );

    await interaction.update({
        embeds: [embed],
        components: [row],
    });
}
