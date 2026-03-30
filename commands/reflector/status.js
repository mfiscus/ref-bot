const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { url, icon } = require('../../config.json');
const { timeSinceSeconds } = require('../../utils');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Provides status information about the reflector.'),

	async execute(interaction) {

		// retrieve status
		const { statusCode, body } = await request(url + '/json/status');
		if (statusCode != 200) return interaction.editReply(`status api returned error ${statusCode}.`);
		const status = await body.json();

		// retrieve reflector metadata
		const { statusCode: metaStatusCode, body: metaBody } = await request(url + '/json/metadata');
		if (metaStatusCode != 200) return interaction.editReply(`metadata api returned error ${metaStatusCode}.`);
		const metadata = await metaBody.json();

		const embed = new EmbedBuilder()
			.setColor(0x2e8b57)
			.setTitle('Reflector Status')
			.setAuthor({ name: `${metadata.reflector_callsign}`, iconURL: `${icon}`, url: `${url}` })
			.addFields(
				{ name: 'Status', value: `${status.reflectorstatus.charAt(0).toUpperCase() + status.reflectorstatus.slice(1)} `, inline: true },
				{ name: 'Uptime', value: timeSinceSeconds(status.reflectoruptimeseconds), inline: true },
			);

		interaction.editReply({ embeds: [embed] });

	},
};