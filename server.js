import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// ANSI color helpers
const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	blue: '\x1b[34m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	cyan: '\x1b[36m',
	bold: '\x1b[1m',
};

function log(label, message, color = colors.reset) {
	console.log(`${colors.bold}${color}[${label}]${colors.reset} ${message}`);
}

app.prepare().then(() => {
	const httpServer = createServer((req, res) => {
		const parsedUrl = parse(req.url, true);
		handle(req, res, parsedUrl);
	});

	const io = new Server(httpServer, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
	});

	io.on('connection', (socket) => {
		log('SOCKET', `User connected: ${socket.id}`, colors.green);

		socket.on('join', (userId) => {
			socket.join(userId);
			log('ROOM', `Socket ${socket.id} joined user room: ${userId}`, colors.cyan);
		});

		socket.on('join-role', (role) => {
			socket.join(role);
			log('ROOM', `Socket ${socket.id} joined role room: ${role}`, colors.blue);
		});

		socket.on('join-room', (roomId) => {
			socket.join(roomId);
			log('ROOM', `Socket ${socket.id} joined discussion room: ${roomId}`, colors.cyan);
		});

		socket.on('message', (data) => {
			log('MESSAGE SENT', `Socket ${socket.id} has send a message ${JSON.stringify(data)}`);
			io.to(data.roomId).emit('message', data);
		});

		socket.on('broadcast', (data) => {
			log('BROADCAST', `To role "${data.role}": ${data.message}`, colors.yellow);
			io.to(data.role).emit('notification', { message: data.message });
		});

		socket.on('notify-user', (data) => {
			log('NOTIFY', `To user "${data.userId}": ${data.message}`, colors.yellow);
			io.to(data.userId).emit('notification', { message: data.message });
		});

		socket.on('disconnect', () => {
			log('SOCKET', `User disconnected: ${socket.id}`, colors.red);
		});
	});

	httpServer
		.once('error', (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			log('SERVER', `Listening at http://localhost:${port} (${dev ? 'dev' : 'prod'})`, colors.bold);
		});
});
