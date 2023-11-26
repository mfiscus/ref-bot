const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { url, icon } = require('../../config.json');

const pluralize = (count, noun, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`;

function TimeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = seconds / 31536000;
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
        .setName('peers')
        .setDescription('Provides information about interlinked peers on the reflector.'),

    async execute(interaction) {

        // retrieve peers
        var {statusCode, headers, body} = await request(url + '/json/peers');
        if (statusCode != 200) return interaction.editReply(`peers api returned error ${statusCode}.`);
        const peers = await body.json();

        // retrieve reflector metadata
        var {statusCode, headers, body} = await request(url + '/json/metadata');
        if (statusCode != 200) return interaction.editReply(`metadata api returned error ${statusCode}.`);
        const metadata = await body.json();

        const embed = new EmbedBuilder()
        .setColor(0x2e8b57)
        .setTitle('Interlinked Peers')
        .setAuthor({ name: `${metadata.reflector_callsign}`, iconURL: `${icon}`, url: `${url}` })
        .addFields(
            { name: 'Callsign', value: ' ', inline: true },
            { name: 'Module', value: ' ', inline: true },
            { name: 'Connected', value: ' ', inline: true },
        );
        
        let [callsign, module, connected] = ["", "", ""];

        for (var i in peers) {
            console.log(peers[i].callsign, peers[i].ip, peers[i].linkedmodule, peers[i].connecttime, peers[i].lastheardtime)
            callsign += peers[i].callsign + '\n';
            module += peers[i].linkedmodule + '\n';
            connected += TimeSince(new Date(peers[i].connecttime)) + '\n';

        }

        embed.addFields(
            { name: ' ', value: `${callsign} `, inline: true },
            { name: ' ', value: `${module} `, inline: true },
            { name: ' ', value: `${connected} `, inline: true },
        );

        interaction.editReply({ embeds: [embed] });
        
    },
};