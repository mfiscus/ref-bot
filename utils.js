const pluralize = (count, noun, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`;

function timeSinceDate(date) {
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

function timeSinceSeconds(seconds) {
	let interval = seconds / 31536000;
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

module.exports = { pluralize, timeSinceDate, timeSinceSeconds };
