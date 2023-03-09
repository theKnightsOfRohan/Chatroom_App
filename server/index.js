const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");

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

//Database of rooms and their message history.
let chatDatabase = new Map([
    ["TC-0001", {
        messageList: [{username: "User1", message: "Hello", room: "TC-0001"}, {username: "User1", message: "Hi", room: "TC-0001"}],
        title: "Test Chat 1",
    }],
    ["TC-0002", {
        messageList: [{username: "User1", message: "Hello", room: "TC-0001"}, {username: "User2", message: "Hi", room: "TC-0002"}],
        title: "Test Chat 2",
    }],
    ["TC-0003", {
        messageList: [{username: "User3", message: "Hello", room: "TC-0003"}, {username: "User1", message: "Hi", room: "TC-0003"}],
        title: "Test Chat 3",
    }],
    ["TC-0004", {
        messageList: [{username: "User2", message: "Hello", room: "TC-0004"}, {username: "User3", message: "Hi", room: "TC-0004"}],
        title: "Test Chat 4",
    }],
    ["TC-0005", {
        messageList: [{username: "User3", message: "Hello", room: "TC-0005"}, {username: "User3", message: "Hi", room: "TC-0005"}],
        title: "Test Chat 5",
    }],
]);

//Database of users and their permissions.
let userPermsDatabase = new Map([
    ["User1", ["TC-0001", "TC-0002", "TC-0003"]],
    ["User2", ["TC-0002", "TC-0003", "TC-0004"]],
    ["User3", ["TC-0003", "TC-0004", "TC-0005"]],
]);

//Socket allows for communication between client and server.
//Every time a user connects to the server, sends connection message through socket, which enables the rest of the functions.
io.on("connection", (socket) => {
    console.log("New User Connected. id: " + socket.id);

    socket.on("get_chats", (username) => {
        let tempChats = [];
        const tempPermList = userPermsDatabase.get(username);

        for (const tempRoom in tempPermList) {
            let tempMessageListLength = chatDatabase.get(tempRoom).messageList.length;

            tempChats.push({
                room: tempRoom,
                title: chatDatabase.get(tempRoom).title,
                mostRecentMessage: chatDatabase.get(tempRoom)[tempMessageListLength - 1].message,
            });
        }

        socket.to(socket.id).emit("receive_chats", tempChats);
    });

    //Server listens to join-room event, and uses sent data from client to join the room.
    //ID is specific random id given to user, and data is the name of the room.
    socket.on("join_room", (room) => {
        socket.join(room);

        //Checks if the room has a message history, and if not, creates one.
        if (!chatDatabase.has(room)) {
            chatDatabase.set(room, []);
        }

        //Sends the message history to the new client.
        socket.emit("past_messages", chatDatabase.get(room));

        console.log("User with ID " + socket.id + " joined room " + room);
    });

    //Server listens to send-message event from any client, and uses sent data to send to all members of the room.
    socket.on("send_message", (messageData) => {

        //Adds message to message history.
        chatDatabase.get(messageData.room).push(messageData);

        //Sends message to all members of the room.
        socket.to(messageData.room).emit("receive_message", messageData);
        
        console.log(chatDatabase.get(messageData.room));
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