import fs from 'node:fs/promises';
import { sendData, sendError } from './send.js';

export const handleAddClient = (req, res, path) => {
	let body = '';

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
			const newClient = JSON.parse(body);

			// Проверяем на заполнение основные данные клиента
			if (!newClient.fullName) {
				sendError(res, 400, 'Неверное именные данные клиента...');
				return;
			} else if (!newClient.phone) {
				sendError(res, 400, 'Неверные телефонные данные клиента...');
				return;
			} else if (!newClient.ticketNumber) {
				sendError(res, 400, 'Неверные билетные данные клиента...');
				return;
			} else if (!newClient.booking) {
				sendError(
					res,
					400,
					'Неверные данные забронированных билетов клиента...'
				);
				return;
			}

			// Проверяем на заполнения поля бронирования
			if (
				newClient.booking &&
				(!newClient.booking.length ||
					!Array.isArray(newClient.booking) ||
					!newClient.booking.every((item) => item.comedian && item.time))
			) {
				sendError(res, 400, 'Неверно заполнены поля бронирования...');
				return;
			}

			// Читаем файл clients.json
			const clientData = await fs.readFile(path, 'utf-8');
			// Преобразуем в JSON формат
			const clients = JSON.parse(clientData);

			clients.push(newClient);

			await fs.writeFile(path, JSON.stringify(clients));

			sendData(res, newClient);
		} catch (error) {
			console.error(`Ошибка сервера при добавлении данных клиента: ${error}`);
			sendError(res, 500, 'Ошибка сервера при добавлении данных клиента...');
		}
	});
};
