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
const { EmbedBuilder } = require('discord.js');
const command = require('../../../commands/reflector/lastheard');

const mockMetaResponse = () => ({
	statusCode: 200,
	body: { json: jest.fn().mockResolvedValue({ reflector_callsign: 'URF847' }) },
});

const makeStation = (callsign) => ({
	callsign,
	vianode: 'URF847 A',
	callsignsuffix: '',
	onmodule: 'A',
	lastheard: new Date(Date.now() - 60000).toISOString(),
});

const mockStationsResponse = (stations) => ({
	statusCode: 200,
	body: { json: jest.fn().mockResolvedValue({ stations }) },
});

describe('lastheard command', () => {
	let interaction;

	beforeEach(() => {
		jest.clearAllMocks();
		interaction = { editReply: jest.fn() };
	});

	it('has correct name and cooldown', () => {
		expect(command.cooldown).toBe(10);
	});

	it('replies with error when stations API returns non-200', async () => {
		request.mockResolvedValueOnce({ statusCode: 500, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('stations api returned error 500.');
	});

	it('replies with message when stations response is null', async () => {
		request.mockResolvedValueOnce({ statusCode: 200, body: { json: jest.fn().mockResolvedValue(null) } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('No stations heard recently.');
	});

	it('replies with message when stations array is missing', async () => {
		request.mockResolvedValueOnce({ statusCode: 200, body: { json: jest.fn().mockResolvedValue({}) } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('No stations heard recently.');
	});

	it('replies with error when metadata API returns non-200', async () => {
		request
			.mockResolvedValueOnce(mockStationsResponse([makeStation('KK7MNZ')]))
			.mockResolvedValueOnce({ statusCode: 503, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith('metadata api returned error 503.');
	});

	it('replies with embed on success', async () => {
		request
			.mockResolvedValueOnce(mockStationsResponse([makeStation('KK7MNZ'), makeStation('K6ABC')]))
			.mockResolvedValueOnce(mockMetaResponse());
		await command.execute(interaction);
		expect(interaction.editReply).toHaveBeenCalledWith({ embeds: [expect.any(Object)] });
	});

	it('limits output to 5 stations', async () => {
		const stations = ['KK7MNZ', 'K6ABC', 'N7XYZ', 'KD9FOO', 'WB4BAR', 'AA1ZZ', 'KK7MNZ'].map(makeStation);
		request
			.mockResolvedValueOnce(mockStationsResponse(stations))
			.mockResolvedValueOnce(mockMetaResponse());
		await command.execute(interaction);
		const embed = EmbedBuilder.mock.results[0].value;
		expect(embed.addFields).toHaveBeenCalledTimes(6);
	});

	it('makes requests to the correct endpoints', async () => {
		request.mockResolvedValueOnce({ statusCode: 500, body: { json: jest.fn() } });
		await command.execute(interaction);
		expect(request).toHaveBeenCalledWith('http://test.example.com/json/stations');
	});
});
