// socket.ts
import { io } from 'socket.io-client';

export const socket = io(`${import.meta.env.VITE_API_BASE_URL}`); // use your actual backend URL
