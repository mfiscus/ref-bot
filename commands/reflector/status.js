const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { url, icon } = require('../../config.json');

const pluralize = (count, noun, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`;

function TimeSince(seconds) {
    var interval = seconds / 31536000;
    if (interval > 1) return pluralize(Math.floor(interval), 'year');
    interval = seconds / 2592000;
    if (interval > 1) return pluralize(Math.floor(interval), 'month');
    interval = seconds / 86400;
    if (interval > 1) return pluralize(Math.floor(interval), 'day');
    interval = seconds / 3600;
    if (interval > 1) return pluralize(Math.floor(interval), 'hour');
    interval = seconds / 60;
    if (interval > 1) return pluralize(Math.floor(interval), 'minute');
    return pluralize(Math.floor(interval), 'second') + ' ago';
}

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Provides status information about the reflector.'),

    async execute(interaction) {

        // retrieve status
        var {statusCode, headers, body} = await request(url + '/json/status');
        if (statusCode != 200) return interaction.editReply(`status api returned error ${statusCode}.`);
        const status = await body.json();

        // retrieve reflector metadata
        var {statusCode, headers, body} = await request(url + '/json/metadata');
        if (statusCode != 200) return interaction.editReply(`metadata api returned error ${statusCode}.`);
        const metadata = await body.json();

        const embed = new EmbedBuilder()
        .setColor(0x2e8b57)
        .setTitle('Reflector Status')
        .setAuthor({ name: `${metadata.reflector_callsign}`, iconURL: `${icon}`, url: `${url}` })
        .addFields(
            { name: 'Status', value: `${status.reflectorstatus.charAt(0).toUpperCase() + status.reflectorstatus.slice(1)} `, inline: true },
            { name: 'Uptime', value: TimeSince(new Date(status.reflectoruptimeseconds)), inline: true },
        );

        interaction.editReply({ embeds: [embed] });
        
    },
};