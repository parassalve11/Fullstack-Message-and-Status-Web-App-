import { io } from "socket.io-client";
import  useUserStorage  from "../store/useUserStorage";

let socket = null;

export const initializeSocket = () => {
  if (socket) return socket;

  const user = useUserStorage.getState().user;

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  socket = io(BACKEND_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  //connection events

  socket.on("connect", () => {
    console.log("socket is connected to ", socket.id);
    socket.emit("user_connected", user._id);
  });

  //checking error

  socket.on("connect_error", (error) => {
    console.error("socket error", error);
  });

  //disconnect events

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected", reason);
  });
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }

  return socket
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
