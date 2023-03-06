import React, {useEffect, useState} from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({socket, username, room}) {
    //Allows different constants to edit themselves using useState.
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    
    //Creates sendMessage function in order to send the currentMessage to the server.
    //Once the client has finished sending the message, updates messageList array and sets message bar back to blank.
    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData = {
                room: room,
                author: username,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
            };

            //Sends message to server.
            await socket.emit("send_message", messageData);

            //Updates messageList.
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    //useEffect function checks if the server has received any new messages, and if so, updates the messageList with the new message.
    useEffect(() => {
        //Receives past messages from server.
        socket.on("past_messages", (pastMessages) => {
            setMessageList(pastMessages);
            console.log("Received past messages: " + pastMessages);
        });

        //Receives new messages from server.
        socket.on("receive_message", (data) => {
            console.log(data);
            setMessageList((list) => [...list, data]);
        });
    }, [socket]);

    //CSS with a nifty scroll bar to prevent overflow.
    //Messages also contain an author and time property.
    //onChange function updates currentMessage every time the message is changed.
    //onKeyUp function sends message if enter key is released.
    return (
        <div className = "chat-window">
            <div className = "chat-header">
                <p>{"Room: " + room}</p>
            </div>
            <div className = "chat-body">
                <ScrollToBottom className = "message-container">
                    {messageList.map((messageContent) => {
                        return (
                        <div className = "message">
                            <div>
                                <div className = "message-content">
                                    <p>{messageContent.message}</p>
                                </div>
                                <div className = "message-meta">
                                    <p id = "time">{messageContent.time}</p>
                                    <p id = "author">{messageContent.author}</p>
                                </div>
                            </div>
                        </div>)
                    })}
                </ScrollToBottom>
            </div>
            <div className = "chat-footer">
                <input 
                    type = "text" 
                    value = {currentMessage}
                    placeholder = "Message..."
                    onChange = {(event) => {
                        setCurrentMessage(event.target.value);
                    }}
                    onKeyUp = {(event) => {
                        event.key === "Enter" && sendMessage();
                    }}
                />
                <button onClick = {sendMessage}>&#9658; </button>
            </div>
        </div>
    )
}

export default Chat