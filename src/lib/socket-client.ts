import { Socket, io } from 'socket.io-client';

let socket: Socket | null = null;

export const initiateSocket = (url: string): void => {
	if (!socket) {
		socket = io(url, {
			transports: ['websocket'],
		});
		console.log('Socket connected');
	}
};

export const disconnectSocket = (): void => {
	if (socket) {
		socket.disconnect();
		console.log('Socket disconnected');
		socket = null;
	}
};

export const joinRoleRoom = (role: string) => {
	if (socket) {
		socket.emit('join-role', role);
	}
};

export const joinUserRoom = (userId: string) => {
	if (socket) {
		socket.emit('join', userId);
	}
};

export const joinDiscussionRoom = (roomId: string) => {
	if (socket) {
		socket.emit('join-room', roomId);
	}
};

export const getSocket = (): Socket | null => {
	return socket;
};
