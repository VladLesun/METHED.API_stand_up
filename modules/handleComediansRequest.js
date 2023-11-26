import { sendData, sendError } from './send.js';

export const handleComediansRequest = async (req, res, comedians, segments) => {
	if (segments.length === 2) {
		const comedian = comedians.find((comedian) => comedian.id === segments[1]);

		if (!comedian) {
			sendError(res, 404, 'Stand Up комик не найден...');
			return;
		}

		sendData(res, comedian);
		return;
	}

	sendData(res, comedians);
	return;
};
