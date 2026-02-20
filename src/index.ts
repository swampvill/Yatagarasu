import 'dotenv/config';
import {
	type ChatInputCommandInteraction,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	type StringSelectMenuInteraction,
} from 'discord.js';
import * as askCommand from './commands/ask.js';
import * as modelsCommand from './commands/models.js';
import { handleModelSelect } from './commands/models.js';
import * as statusCommand from './commands/status.js';

// 環境変数チェック
const requiredEnv = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
	console.error(`❌ 必須環境変数が不足しています: ${missing.join(', ')}`);
	console.error('  .env.example を参考に .env ファイルを作成してください');
	process.exit(1);
}

// コマンド登録
interface Command {
	data: { name: string };
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const commands = new Collection<string, Command>();
commands.set(askCommand.data.name, askCommand);
commands.set(modelsCommand.data.name, modelsCommand);
commands.set(statusCommand.data.name, statusCommand);

// クライアント作成
const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

// Ready イベント
client.once(Events.ClientReady, (readyClient) => {
	console.log(`🌉 Bridge 稼働中: ${readyClient.user.tag}`);
	console.log(
		`   gemini CLI: ${process.env.GEMINI_CLI_PATH || '/usr/local/bin/gemini'}`,
	);
});

// スラッシュコマンド処理
client.on(Events.InteractionCreate, async (interaction) => {
	// セレクトメニュー（モデル選択）
	if (interaction.isStringSelectMenu()) {
		if (interaction.customId === 'model_select') {
			await handleModelSelect(interaction as StringSelectMenuInteraction);
		}
		return;
	}

	// スラッシュコマンド
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(`コマンドエラー [${interaction.commandName}]:`, error);
		const content = '❌ コマンドの実行中にエラーが発生しました';
		if (interaction.replied || interaction.deferred) {
			await interaction.editReply({ content });
		} else {
			await interaction.reply({ content, ephemeral: true });
		}
	}
});

// Bot 起動
client.login(process.env.DISCORD_TOKEN);
