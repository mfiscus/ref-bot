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
const command = require('../../../commands/reflector/peers');

const mockMetaResponse = () => ({
	statusCode: 200,
	body: { json: jest.fn().mockResolvedValue({ reflector_callsign: 'URF847' }) },
});

const mockPeersResponse = (peers) => ({
	statusCode: 200,
	body: { json: jest.fn().mockResolvedValue(peers) },
});

describe('peers command', () => {
	let interaction;

	beforeEach(() => {
		jest.clearAllMocks();
		interaction = { editReply: jest.fn() };
	});

	it('has correct name and cooldown', () => {
		expect(command.cooldown).toBe(10);
	});

	it('replies with error when peers API returns non-200', async () => {
		request.mockResolvedValueOnce({ statusCode: 503, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('peers api returned error 503.');
	});

	it('replies with message when no peers are connected', async () => {
		request.mockResolvedValueOnce({ statusCode: 200, body: { json: jest.fn().mockResolvedValue(null) } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('No peers connected.');
	});

	it('replies with error when metadata API returns non-200', async () => {
		request
			.mockResolvedValueOnce(mockPeersResponse([{ callsign: 'KK7MNZ', linkedmodule: 'A', connecttime: new Date().toISOString() }]))
			.mockResolvedValueOnce({ statusCode: 500, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('metadata api returned error 500.');
	});

	it('replies with embed on success', async () => {
		const peers = [
			{ callsign: 'KK7MNZ', ip: '1.2.3.4', linkedmodule: 'A', connecttime: new Date(Date.now() - 7200000).toISOString(), lastheardtime: null },
			{ callsign: 'K6ABC', ip: '5.6.7.8', linkedmodule: 'B', connecttime: new Date(Date.now() - 3600000).toISOString(), lastheardtime: null },
		];
		request
			.mockResolvedValueOnce(mockPeersResponse(peers))
			.mockResolvedValueOnce(mockMetaResponse());
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [expect.any(Object)] });
	});

	it('makes requests to the correct endpoints', async () => {
		request.mockResolvedValueOnce({ statusCode: 503, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(request).toHaveBeenCalledWith('http://test.example.com/json/peers');
	});
});
