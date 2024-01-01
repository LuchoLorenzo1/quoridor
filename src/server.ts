import { io } from "socket.io-client";

console.log(process.env.NEXT_PUBLIC_WS_URL);
const socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000", {
  withCredentials: true,
  autoConnect: true,
});

export default socket;
