const { pluralize, timeSinceDate, timeSinceSeconds } = require('../../utils');

describe('pluralize', () => {
	it('returns singular form for count of 1', () => {
		expect(pluralize(1, 'year')).toBe('1 year');
	});

	it('returns plural form for count of 0', () => {
		expect(pluralize(0, 'year')).toBe('0 years');
	});

	it('returns plural form for count greater than 1', () => {
		expect(pluralize(3, 'day')).toBe('3 days');
	});

	it('supports custom suffix', () => {
		expect(pluralize(2, 'match', 'es')).toBe('2 matches');
	});
});

describe('timeSinceDate', () => {
	it('returns years for dates more than a year ago', () => {
		const date = new Date(Date.now() - 2 * 365 * 24 * 3600 * 1000);
		expect(timeSinceDate(date)).toBe('2 years ago');
	});

	it('returns months for dates more than a month ago', () => {
		const date = new Date(Date.now() - 2 * 30 * 24 * 3600 * 1000);
		expect(timeSinceDate(date)).toBe('2 months ago');
	});

	it('returns days for dates more than a day ago', () => {
		const date = new Date(Date.now() - 3 * 24 * 3600 * 1000);
		expect(timeSinceDate(date)).toBe('3 days ago');
	});

	it('returns hours for dates more than an hour ago', () => {
		const date = new Date(Date.now() - 5 * 3600 * 1000);
		expect(timeSinceDate(date)).toBe('5 hours ago');
	});

	it('returns minutes for dates more than a minute ago', () => {
		const date = new Date(Date.now() - 10 * 60 * 1000);
		expect(timeSinceDate(date)).toBe('10 minutes ago');
	});

	it('returns singular for exactly 1 unit', () => {
		const date = new Date(Date.now() - 1.5 * 3600 * 1000);
		expect(timeSinceDate(date)).toBe('1 hour ago');
	});
});

describe('timeSinceSeconds', () => {
	it('returns years for uptime greater than a year', () => {
		expect(timeSinceSeconds(2 * 365 * 24 * 3600)).toBe('2 years');
	});

	it('returns months for uptime greater than a month', () => {
		expect(timeSinceSeconds(2 * 30 * 24 * 3600)).toBe('2 months');
	});

	it('returns days for uptime greater than a day', () => {
		expect(timeSinceSeconds(3 * 24 * 3600)).toBe('3 days');
	});

	it('returns hours for uptime greater than an hour', () => {
		expect(timeSinceSeconds(5 * 3600)).toBe('5 hours');
	});

	it('returns minutes for uptime greater than a minute', () => {
		expect(timeSinceSeconds(10 * 60)).toBe('10 minutes');
	});

	it('returns singular for exactly 1 unit', () => {
		expect(timeSinceSeconds(1.5 * 3600)).toBe('1 hour');
	});
});
