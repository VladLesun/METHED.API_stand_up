import fs from 'node:fs/promises';
import { sendData, sendError } from './send.js';

export const handleUpdateClient = async (req, res, segments, path) => {
	let body = '';
	const ticketNumber = segments[1];
	try {
		req.on('data', (chunk) => {
			body += chunk;
		});
	} catch (error) {
		console.log('Ошибка при чтении запроса...');
		sendError(res, 500, 'Ошибка при чтении запроса...');
	}

	req.on('end', async () => {
		try {
			const updateDataClient = JSON.parse(body);

			// Проверяем на заполнение основные данные клиента
			if (!updateDataClient.fullName) {
				sendError(res, 400, 'Неверное именные данные клиента...');
				return;
			} else if (!updateDataClient.phone) {
				sendError(res, 400, 'Неверные телефонные данные клиента...');
				return;
			} else if (!updateDataClient.ticketNumber) {
				sendError(res, 400, 'Неверные билетные данные клиента...');
				return;
			} else if (!updateDataClient.booking) {
				sendError(
					res,
					400,
					'Неверные данные забронированных билетов клиента...'
				);
				return;
			}

			// Проверяем на заполнения поля бронирования
			if (
				updateDataClient.booking &&
				(!updateDataClient.booking.length ||
					!Array.isArray(updateDataClient.booking) ||
					!updateDataClient.booking.every((item) => item.comedian && item.time))
			) {
				sendError(res, 400, 'Неверно заполнены поля бронирования...');
				return;
			}

			// Читаем файл clients.json
			const clientData = await fs.readFile(path, 'utf-8');
			// Преобразуем в JSON формат
			const clients = JSON.parse(clientData);
			//
			const clientIndex = clients.findIndex(
				(client) => client.ticketNumber === ticketNumber
			);

			if (clientIndex === -1) {
				sendError(res, 404, 'Клиент с данным номером билета не найден...');
			}

			await fs.writeFile(path, JSON.stringify(clients));

			clients[clientIndex] = {
				...clients[clientIndex],
				...updateDataClient,
			};

			sendData(res, clients[clientIndex]);
		} catch (error) {
			console.error(`Ошибка сервера при обновлении данных клиента: ${error}`);
			sendError(res, 500, 'Ошибка сервера при обновлении данных клиента...');
		}
	});
};
