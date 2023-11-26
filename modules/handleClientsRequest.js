import fs from 'node:fs/promises';
import { sendData, sendError } from './send.js';

export const handleClientsRequest = async (req, res, ticketNumber, path) => {
	try {
		const clientsData = await fs.readFile(path, 'utf-8');
		const clients = JSON.parse(clientsData);

		const client = clients.find((client) => client.ticketNumber === ticketNumber);

		if (!client) {
			sendError(res, 404, 'Клиент с данным номером билета отсутствует...');
			return;
		}

		sendData(res, client);
	} catch (error) {
		console.error(`Ошибка при обработке запроса ${error}`);
		sendError(res, 500, 'Ошибка сервера при обработке запроса клиента...');
	}
};
