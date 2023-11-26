import http from 'node:http';
import fs from 'node:fs/promises';
import { sendData, sendError } from './modules/send.js';
import { checkFile } from './modules/checkFile.js';
import { handleComediansRequest } from './modules/handleComediansRequest.js';
import { handleAddClient } from './modules/handleAddClient.js';
import { handleClientsRequest } from './modules/handleClientsRequest.js';
import { handleUpdateClient } from './modules/handleUpdateClient.js';

const PORT = 3214;
const COMEDIANS = './comedians.json';
const CLIENTS = './clients.json';

const comediansData = await fs.readFile(COMEDIANS, 'utf-8');
const comedians = JSON.parse(comediansData);

const startServer = async () => {
	if (!(await checkFile(COMEDIANS))) {
		return;
	}

	await checkFile(CLIENTS, true);

	http
		.createServer(async (req, res) => {
			try {
				res.setHeader('Access-Control-Allow-Origin', '*');
				const segments = req.url.split('/').filter(Boolean);

				if (req.method === 'GET' && segments[0] === 'comedians') {
					// POST /comedians
					// Получаем всех Stand Up комиков

					handleComediansRequest(req, res, comedians, segments);
					return;
				}

				if (req.method === 'POST' && segments[0] === 'clients') {
					// POST /clients
					// Добавление клиента

					handleAddClient(req, res, CLIENTS);
					return;
				}

				if (
					req.method === 'GET' &&
					segments[0] === 'clients' &&
					segments.length === 2
				) {
					// GET /clients/:ticket
					// Получаем клиента по номеру билета

					const ticketNumber = segments[1];
					handleClientsRequest(req, res, ticketNumber, CLIENTS);
					return;
				}

				if (
					req.method === 'PATCH' &&
					segments[0] === 'clients' &&
					segments.length === 2
				) {
					// PATCH /clients/:ticket
					// Обновляем клиента по номеру билета

					handleUpdateClient(req, res, segments, CLIENTS);
					return;
				}

				sendError(res, 404, 'Страница не найдена...');
			} catch (error) {
				sendError(res, 500, `Ошибка сервера... ${error}`);
			}
		})
		.listen(PORT);

	console.log(`Сервер запущен на http://localhost:${PORT}`);
};

startServer();
