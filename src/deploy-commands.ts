import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import * as askCommand from './commands/ask.js';
import * as cancelCommand from './commands/cancel.js';
import * as modelsCommand from './commands/models.js';
import * as statusCommand from './commands/status.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
	console.error('❌ DISCORD_TOKEN と DISCORD_CLIENT_ID が必要です');
	process.exit(1);
}

const commands = [
	askCommand.data.toJSON(),
	cancelCommand.data.toJSON(),
	modelsCommand.data.toJSON(),
	statusCommand.data.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log(`🔄 ${commands.length} 個のコマンドを登録中...`);

		if (guildId) {
			// ギルドコマンド（即座に反映）
			await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
				body: commands,
			});
			console.log(`✅ ギルド (${guildId}) にコマンドを登録しました`);
		} else {
			// グローバルコマンド（反映に最大1時間）
			await rest.put(Routes.applicationCommands(clientId), {
				body: commands,
			});
			console.log('✅ グローバルコマンドを登録しました');
		}
	} catch (error) {
		console.error('❌ コマンド登録エラー:', error);
	}
})();
