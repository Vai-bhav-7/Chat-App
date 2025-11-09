import { createContext, useContext, useState,useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children })=>{

    const [messages, setmessages] = useState([]);
    const [users, setusers] = useState([]);
    const [selectedUser, setselectedUser] = useState(null);
    const [unseenMessages, setunseenMessages] = useState({})

    const {socket, axios} = useContext(AuthContext);

    //to get all users for sidebar
    const getUsers = async() => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if(data.success) {
                setusers(data.users)
                setunseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message);

        }
    }

    //get message for selected users
    const getMessages = async (userId)=>{
        try {
           const { data } = await axios.get(`/api/messages/${userId}`);
           if(data.success)
           {
            setmessages(data.messages)
           }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const  { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if(data.success){
                setmessages((previousMessages)=> [...previousMessages, data.newMessage])
            } else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //to subscribe to messages for selected user
    const subscribeToMesages = async () =>{
        if(!socket) return;

        socket.on("newMessage", (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setmessages((previousMessages)=> [...previousMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`)
            } else{
                setunseenMessages((prevunseenmessages)=>({
                    ...prevunseenmessages, [newMessage.senderId] : prevunseenmessages[newMessage.senderId] ? prevunseenmessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    //function to unsubsribe from messages
    const unsubsribeFromMessages = ()=>{
        if(socket) socket.off("newMessage");
    }

    useEffect(() => {
      subscribeToMesages();
      return ()=> unsubsribeFromMessages();
    }, [socket, selectedUser])
    

    const value = {
        messages, users, selectedUser, getUsers, getMessages, sendMessage, setselectedUser, unseenMessages, setunseenMessages
    }

    return (
    <ChatContext.Provider value={value}>
            { children }
    </ChatContext.Provider>)
}