// Replace your current socket import with:
import io  from "socket.io-client";

// Initialize the socket connection
const socket = io("http://localhost:3001"); // Replace with your actual backend URL

export default socket;
