import "./App.css";
import io from "socket.io-client";
import { useState } from "react";
import Chat from './Chat';

//Creates socket that connects app to client at 3001.
const socket = io.connect("http://localhost:3001");

function App() {
  //useState function allows constants to change based on user input.
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  
  //joinRoom function allows client to notify server that the user has joined a room. Also enables chat.
  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  //Different states for client. If the user has not joined a room, it will show the join chat interface.
  //If the user has joined a room, it will show the chat interface.
  return (
    <div className="App">
      {!showChat ? (
        <div className = "joinChatContainer">
          <h3>Join a Chat</h3>
          <input 
            type = "text" 
            placeholder = "Username..." 
            onChange = {(event) => {
              setUsername(event.target.value);
            }}
          />
          <input 
            type = "text" 
            placeholder = "Room Name..."
            onChange = {(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick = {joinRoom}>Join a Room</button>
        </div>
      ) : (
        <Chat socket = {socket} username = {username} room = {room}/>
      )}
    </div>
  );
}

export default App;