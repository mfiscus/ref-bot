jest.mock('undici');
jest.mock('discord.js', () => ({
	SlashCommandBuilder: jest.fn().mockImplementation(() => ({
		setName: jest.fn().mockReturnThis(),
		setDescription: jest.fn().mockReturnThis(),
	})),
	EmbedBuilder: jest.fn().mockImplementation(() => ({
		setColor: jest.fn().mockReturnThis(),
		setTitle: jest.fn().mockReturnThis(),
		setAuthor: jest.fn().mockReturnThis(),
		addFields: jest.fn().mockReturnThis(),
	})),
}));
jest.mock('../../../config.json', () => ({
	url: 'http://test.example.com',
	icon: 'http://example.com/icon.png',
}), { virtual: true });

const { request } = require('undici');
const command = require('../../../commands/reflector/links');

const mockMetaResponse = () => ({
	statusCode: 200,
	body: { json: jest.fn().mockResolvedValue({ reflector_callsign: 'URF847' }) },
});

const mockLinksResponse = (links) => ({
	statusCode: 200,
	body: { json: jest.fn().mockResolvedValue(links) },
});

describe('links command', () => {
	let interaction;

	beforeEach(() => {
		jest.clearAllMocks();
		interaction = { editReply: jest.fn() };
	});

	it('has correct name and cooldown', () => {
		expect(command.cooldown).toBe(10);
	});

	it('replies with error when links API returns non-200', async () => {
		request.mockResolvedValueOnce({ statusCode: 500, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('links api returned error 500.');
	});

	it('replies with message when no links are connected', async () => {
		request.mockResolvedValueOnce({ statusCode: 200, body: { json: jest.fn().mockResolvedValue(null) } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('No links connected.');
	});

	it('replies with error when metadata API returns non-200', async () => {
		const links = [{ callsign: 'KK7MNZ', ip: '1.2.3.4', linkedmodule: 'A', protocol: 'XLX', connecttime: new Date().toISOString() }];
		request
			.mockResolvedValueOnce(mockLinksResponse(links))
			.mockResolvedValueOnce({ statusCode: 503, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('metadata api returned error 503.');
	});

	it('replies with embed on success', async () => {
		const links = [
			{ callsign: 'KK7MNZ', ip: '1.2.3.4', linkedmodule: 'A', protocol: 'XLX', connecttime: new Date(Date.now() - 3600000).toISOString(), lastheardtime: null },
		];
		request
			.mockResolvedValueOnce(mockLinksResponse(links))
			.mockResolvedValueOnce(mockMetaResponse());
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [expect.any(Object)] });
	});

	it('normalizes DMRMmdvm protocol label to DMR', async () => {
		const links = [
			{ callsign: 'KK7MNZ', ip: '1.2.3.4', linkedmodule: 'A', protocol: 'DMRMmdvm', connecttime: new Date(Date.now() - 3600000).toISOString(), lastheardtime: null },
		];
		request
			.mockResolvedValueOnce(mockLinksResponse(links))
			.mockResolvedValueOnce(mockMetaResponse());
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [expect.any(Object)] });
	});

	it('makes requests to the correct endpoints', async () => {
		request.mockResolvedValueOnce({ statusCode: 500, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(request).toHaveBeenCalledWith('http://test.example.com/json/links');
	});
});
