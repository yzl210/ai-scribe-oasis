import { io, Socket } from 'socket.io-client';
import { API_BASE } from '@/lib/api.ts';

let socket: Socket | undefined;

export const getSocket = () => {
    if (!socket) {
        socket = io(API_BASE, {
            path: '/ws',
            transports: ['websocket'],
        });
    }
    return socket;
};


