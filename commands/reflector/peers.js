const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { url, icon } = require('../../config.json');
const { timeSinceDate } = require('../../utils');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('peers')
		.setDescription('Provides information about interlinked peers on the reflector.'),

	async execute(interaction) {

		// retrieve peers
		const { statusCode, body } = await request(url + '/json/peers');
		if (statusCode != 200) return interaction.editReply(`peers api returned error ${statusCode}.`);
		const peers = await body.json();
		if (!peers) return interaction.editReply('No peers connected.');

		// retrieve reflector metadata
		const { statusCode: metaStatusCode, body: metaBody } = await request(url + '/json/metadata');
		if (metaStatusCode != 200) return interaction.editReply(`metadata api returned error ${metaStatusCode}.`);
		const metadata = await metaBody.json();

		const embed = new EmbedBuilder()
			.setColor(0x2e8b57)
			.setTitle('Interlinked Peers')
			.setAuthor({ name: `${metadata.reflector_callsign}`, iconURL: `${icon}`, url: `${url}` })
			.addFields(
				{ name: 'Callsign', value: ' ', inline: true },
				{ name: 'Module', value: ' ', inline: true },
				{ name: 'Connected', value: ' ', inline: true },
			);

		let [callsign, module, connected] = ['', '', ''];

		for (const i in peers) {
			console.log(peers[i].callsign, peers[i].ip, peers[i].linkedmodule, peers[i].connecttime, peers[i].lastheardtime);
			callsign += peers[i].callsign + '\n';
			module += peers[i].linkedmodule + '\n';
			connected += timeSinceDate(new Date(peers[i].connecttime)) + '\n';

		}

		embed.addFields(
			{ name: ' ', value: `${callsign} `, inline: true },
			{ name: ' ', value: `${module} `, inline: true },
			{ name: ' ', value: `${connected} `, inline: true },
		);

		interaction.editReply({ embeds: [embed] });

	},
};