import { EmbedBuilder } from 'discord.js';
import type { BridgeResult } from '../bridge.js';
import type { ModelInfo } from '../bridge.js';

const COLORS = {
    primary: 0x5865f2, // Discord Blurple
    success: 0x57f287,
    warning: 0xfee75c,
    error: 0xed4245,
    info: 0x5bc0eb,
} as const;

/**
 * 実行中を示すEmbed
 */
export function buildThinkingEmbed(prompt: string): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(COLORS.info)
        .setTitle('🧠 伝達中...')
        .setDescription(`> ${truncate(prompt, 200)}`)
        .setFooter({ text: '計画を練っています...' })
        .setTimestamp();
}

/**
 * 実行結果を表示するEmbed
 */
export function buildResultEmbed(
    prompt: string,
    result: BridgeResult,
): EmbedBuilder {
    if (result.timedOut) {
        return new EmbedBuilder()
            .setColor(COLORS.warning)
            .setTitle('⏱️ タイムアウト')
            .setDescription(
                '実行時間が制限を超えたため中断しました。',
            )
            .addFields({ name: '指示', value: truncate(prompt, 200) })
            .setTimestamp();
    }

    if (result.exitCode !== 0) {
        return new EmbedBuilder()
            .setColor(COLORS.error)
            .setTitle('❌ エラー')
            .setDescription(
                `\`\`\`\n${truncate(result.stderr || result.stdout, 1500)}\n\`\`\``,
            )
            .addFields({ name: '指示', value: truncate(prompt, 200) })
            .setTimestamp();
    }

    const output = result.stdout.trim();

    return new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle('✅ 実行完了')
        .setDescription(
            output
                ? `\`\`\`\n${truncate(output, 3500)}\n\`\`\``
                : '（出力なし）',
        )
        .addFields({ name: '📋 指示', value: truncate(prompt, 200) })
        .setTimestamp();
}

/**
 * モデル一覧のEmbed
 */
export function buildModelsEmbed(models: ModelInfo[]): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setColor(COLORS.primary)
        .setTitle('⚙️ モデル管理')
        .setDescription('利用可能なモデルの一覧と現在の選択状態');

    for (const model of models) {
        const indicator = model.isActive ? '🟢' : '⚪';
        const status = model.isActive ? '**（選択中）**' : '';
        embed.addFields({
            name: `${indicator} ${model.displayName}`,
            value: `\`${model.name}\` ${status}`,
            inline: true,
        });
    }

    embed.setTimestamp();
    return embed;
}

/**
 * 文字列を指定長で切り詰める
 */
function truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return `${text.slice(0, max - 3)}...`;
}
