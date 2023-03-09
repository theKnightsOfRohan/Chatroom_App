import "./App.css";
import io from "socket.io-client";
import {useEffect} from "react";
import React from "react";
import Chat from './Chat';
import ScrollToBottom from "react-scroll-to-bottom";

//Connects client at port 3000 to server at port 3001.
const socket = io.connect("http://localhost:3001");

function App() {
    //useState function allows constants to change based on user input.
    const [username, setUsername] = React.useState("");
    const [room, setRoom] = React.useState("");
    const [showChat, setShowChat] = React.useState(false);
    const [ChatList, setChatList] = React.useState([]);



    useEffect(() => {
        socket.on("receive_chats", (data) => {
            setChatList(data);
        });
    });

    const getChats = (username) => {
        socket.emit("get_chats", username);
    }

    //joinRoom function allows client to notify server that the user has joined a room. Also enables chat.
    const joinRoom = (clickedChat) => {
        socket.emit("join_room", clickedChat.room);
        setRoom(clickedChat.room);
        setShowChat(true);
    };

    //Different states for client. If the user has not joined a room, it will show the join interface.
    //If the user has joined a room, it will show the chat interface.
    return (
        <div className="App">
            {!showChat ? (
                <div className="chat-select">
                    <div className="chat-select-header">
                        <input className="chat-select-input"
                            type = "text"
                            value = {username}
                            placeholder = "Username..."
                            onChange = {(event) => {
                                setUsername(event.target.value);
                        }}
                        onKeyUp = {(event) => {
                            event.key === "Enter" && getChats();}}
                        >
                        </input>
                    </div>
                <div className="chat-select-body">
                    <ScrollToBottom className="chat-select-container">
                        {ChatList.map((Chat) => (
                            <div className="chat-select-item">
                                <button className="chat-select-button" onClick={() => joinRoom(Chat)}>
                                    <div>
                                        <p className="chat-select-title">{Chat.title}</p>
                                    </div>
                                    <div>
                                       <p className="chat-select-lastmessage">{Chat.mostRecentMessage}</p>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </ScrollToBottom>
                </div>
                <div className="chat-select-footer">
                    <button className="footerbutton1">
                        <p>I</p>
                    </button>
                    <button className="footerbutton2">
                        <p>Am</p>
                    </button>
                    <button className="footerbutton3">
                        <p>Iron</p>
                    </button>
                    <button className="footerbutton4">
                        <p>Man</p>
                    </button>
                  </div>
                </div>
            ) : (
                <Chat socket = {socket} username = {username} room = {room}/>
            )}
        </div>
    );
}

export default App;