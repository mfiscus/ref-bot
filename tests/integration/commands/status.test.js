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
const command = require('../../../commands/reflector/status');

const mockMetaResponse = () => ({
	statusCode: 200,
	body: { json: jest.fn().mockResolvedValue({ reflector_callsign: 'XRF001' }) },
});

const mockStatusResponse = (data) => ({
	statusCode: 200,
	body: { json: jest.fn().mockResolvedValue(data) },
});

describe('status command', () => {
	let interaction;

	beforeEach(() => {
		jest.clearAllMocks();
		interaction = { editReply: jest.fn() };
	});

	it('has correct name and cooldown', () => {
		expect(command.cooldown).toBe(10);
	});

	it('replies with error when status API returns non-200', async () => {
		request.mockResolvedValueOnce({ statusCode: 404, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('status api returned error 404.');
	});

	it('replies with error when metadata API returns non-200', async () => {
		request
			.mockResolvedValueOnce(mockStatusResponse({ reflectorstatus: 'online', reflectoruptimeseconds: 3600 }))
			.mockResolvedValueOnce({ statusCode: 502, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('metadata api returned error 502.');
	});

	it('replies with embed on success', async () => {
		request
			.mockResolvedValueOnce(mockStatusResponse({ reflectorstatus: 'online', reflectoruptimeseconds: 86401 }))
			.mockResolvedValueOnce(mockMetaResponse());
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [expect.any(Object)] });
	});

	it('makes requests to the correct endpoints', async () => {
		request.mockResolvedValueOnce({ statusCode: 404, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(request).toHaveBeenCalledWith('http://test.example.com/json/status');
	});
});
