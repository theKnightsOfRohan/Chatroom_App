const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");

//Tells browser which places it should allow data to be transmitted to and from the domain.
app.use(cors());

//Creates a server at localhost.
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

//Socket in io allows for communication between client and server.
io.on("connection", (socket) => {
    console.log("New User Connected. id: " + socket.id);

    //Server listens to join-room event, and uses sent data from client to join the room.
    //ID is specific random id given to user, and data is the name of the room.
    socket.on("join_room", (data) => {
        socket.join(data);

        console.log("User with ID " + socket.id + " joined room " + data);
    });

    //Server listens to join-room event from any client, and uses sent data to send to all members of the room.
    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
        
        console.log(data);
    });

    //Server listens to disconnect event from any client. 
    //Could use further improvement, such as addition of chat notifications when use disconnects.
    socket.on("disconnect", () => {
        console.log("User disconnected. id: ", socket.id);
    });
});

//Checks if client is running in port 3001.
server.listen(3001, () => {
    console.log("Running");
});