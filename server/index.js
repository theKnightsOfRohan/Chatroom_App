const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");

let pastMessageDatabase = new Map();

//Tells browser which places it should allow data to be transmitted to and from the domain.
app.use(cors());

//Creates a server at the specified localhost port.
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

//Socket allows for communication between client and server.
//Every time a user connects to the server, sends connection message through socket, which enables the rest of the functions.
io.on("connection", (socket) => {
    console.log("New User Connected. id: " + socket.id);

    //Server listens to join-room event, and uses sent data from client to join the room.
    //ID is specific random id given to user, and data is the name of the room.
    socket.on("join_room", (room) => {
        socket.join(room);

        //Checks if the room has a message history, and if not, creates one.
        if (!pastMessageDatabase.has(room)) {
            pastMessageDatabase.set(room, []);
        }

        //Sends the message history to the new client.
        socket.emit("past_messages", pastMessageDatabase.get(room));

        console.log("User with ID " + socket.id + " joined room " + room);
    });

    //Server listens to send-message event from any client, and uses sent data to send to all members of the room.
    socket.on("send_message", (messageData) => {

        //Adds message to message history.
        if (pastMessageDatabase.has(messageData.room)) {
            pastMessageDatabase.get(messageData.room).push(messageData);
        }

        //Sends message to all members of the room.
        socket.to(messageData.room).emit("receive_message", messageData);
        
        console.log(pastMessageDatabase.get(messageData.room));
    });

    //Server listens to disconnect event from any client. 
    //Could use further improvement, such as addition of chat notifications when user disconnects.
    socket.on("disconnect", () => {
        console.log("User disconnected. id: ", socket.id);
    });
});

//Checks if client is running in port 3001.
server.listen(3001, () => {
    console.log("Running");
});