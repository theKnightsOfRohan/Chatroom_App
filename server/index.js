const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require("socket.io");
const {Pool} = require("pg");

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

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Dadamndud3',
    port: 5432,
});

//Socket allows for communication between client and server.
//Every time a user connects to the server, sends connection message through socket, which enables the rest of the functions.
io.on("connection", (socket) => {
    console.log("New User Connected. id: " + socket.id);

    socket.on("get_chats", (userid) => {
        pool.query("SELECT chats FROM user_chat_perms_database WHERE userid = $1", [userid], (error, results) => {
            try {
                if (error) {
                    throw error;
                }

                const chatPermissions = results.rows[0].chats;

                console.log(chatPermissions);

                pool.query("SELECT * FROM chat_database WHERE roomid = ANY($1)", [chatPermissions], (error, results) => {
                    try {
                        if (error) {
                            throw error;
                        }

                        let chatList = [];

                        for (let i = 0; i < results.rows.length; i++) {
                            chatList.push({
                                roomid: results.rows[i].roomid,
                                title: results.rows[i].roomname,
                                mostRecentMessage: results.rows[i].previewmessage,
                            });
                        }

                        socket.emit("receive_chats", chatList);
                    } catch (error) {
                        console.error(error);
                    }
                });
            } catch (error) {
                console.error(error);
            }
        });
    });

    //Server listens to join-room event, and uses sent data from client to join the room.
    //ID is specific random id given to user, and data is the name of the room.
    socket.on("join_room", (roomid) => {
        pool.query("SELECT jsonb_array_elements(messagelist) FROM chat_database WHERE roomid = $1", [roomid], (error, results) => {
            try {
                if (error) {
                    throw error;
                }

                const chatMessages = results.rows[0].messagelist.map((message) => JSON.parse(message));

                socket.emit("past_messages", chatMessages);
            } catch (error) {
                console.error(error);
            }
        });

        console.log("User with ID " + socket.id + " joined room " + roomid);
    });

    //Server listens to send-message event from any client, and uses sent data to send to all members of the room.
    socket.on("send_message", (messageData) => {
        pool.query("SELECT messagelist FROM chat_database WHERE roomid = $1", [messageData.roomid], (error, results) => {
            try {
                if (error) {
                    throw error;
                }

                const messageList = results.rows[0].messagelist;

                messageList.push(JSON.stringify(messageData));

                pool.query("UPDATE chat_database SET messagelist = $1 WHERE roomid = $2", [messageList, messageData.roomid], (error, results) => {
                    try {
                        if (error) {
                            throw error;
                        }

                        io.to(messageData.roomid).emit("receive_message", messageData);
                    } catch (error) {
                        console.error(error);
                    }
                });
            } catch (error) {
                console.error(error);
            }
        });
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