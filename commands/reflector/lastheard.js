const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { url, icon } = require('../../config.json');
const limit = 5;

const pluralize = (count, noun, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`;

function TimeSince(date) {
	const seconds = Math.floor((new Date() - date) / 1000);
	let interval = seconds / 31536000;
	if (interval > 1) return pluralize(Math.floor(interval), 'year') + ' ago';
	interval = seconds / 2592000;
	if (interval > 1) return pluralize(Math.floor(interval), 'month') + ' ago';
	interval = seconds / 86400;
	if (interval > 1) return pluralize(Math.floor(interval), 'day') + ' ago';
	interval = seconds / 3600;
	if (interval > 1) return pluralize(Math.floor(interval), 'hour') + ' ago';
	interval = seconds / 60;
	if (interval > 1) return pluralize(Math.floor(interval), 'minute') + ' ago';
	return pluralize(Math.floor(interval), 'second') + ' ago';
}

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('lastheard')
		.setDescription('Provides information about the last 5 stations heard on the reflector.'),

	async execute(interaction) {

		// retrieve last heard stations
		const { statusCode, body } = await request(url + '/json/stations');
		if (statusCode != 200) return interaction.editReply(`stations api returned error ${statusCode}.`);
		const stations = await body.json();
		if (!stations || !stations.stations) return interaction.editReply('No stations heard recently.');

		// retrieve reflector metadata
		const { statusCode: metaStatusCode, body: metaBody } = await request(url + '/json/metadata');
		if (metaStatusCode != 200) return interaction.editReply(`metadata api returned error ${metaStatusCode}.`);
		const metadata = await metaBody.json();

		const embed = new EmbedBuilder()
			.setColor(0x2e8b57)
			.setTitle('Last 5 Stations Heard')
			.setAuthor({ name: `${metadata.reflector_callsign}`, iconURL: `${icon}`, url: `${url}` })
			.addFields(
				{ name: 'Callsign', value: ' ', inline: true },
				{ name: 'On Module', value: ' ', inline: true },
				{ name: 'When', value: ' ', inline: true },
			);

		for (const i in stations.stations) {
			// limit to 5
			if (i >= limit) break;
			console.log(stations.stations[i].callsign, stations.stations[i].vianode, stations.stations[i].callsignsuffix, stations.stations[i].onmodule, stations.stations[i].lastheard);
			embed.addFields(
				{ name: ' ', value: `${stations.stations[i].callsign} `, inline: true },
				{ name: ' ', value: `${stations.stations[i].onmodule} `, inline: true },
				{ name: ' ', value: TimeSince(new Date(stations.stations[i].lastheard)), inline: true },
			);
		}
		interaction.editReply({ embeds: [embed] });

	},
};