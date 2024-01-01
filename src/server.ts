import { io } from "socket.io-client";

console.log(process.env.WS_URL);
const socket = io(process.env.WS_URL || "http://localhost:8000", {
  withCredentials: true,
  autoConnect: true,
});

export default socket;
