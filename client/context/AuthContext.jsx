import { createContext,useEffect,useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children })=>{

    const [token, settoken] = useState(localStorage.getItem("token"))
    const [authUser, setauthUser] = useState(null);
    const [onlineUsers, setonlineUsers] = useState([]);
    const [socket, setsocket] = useState(null);


    //check user is authenticated or not
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if(data.success) {
                setauthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //login function to handle user authentication and socket connection
    const login = async (state,credentials) =>{
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if(data.success){
                setauthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                settoken(data.token);
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //logout function to handle user logout and socket disconnection
    const logout = async() => {
        localStorage.removeItem("token");
        settoken(null);
        setauthUser(null);
        setonlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out Successfully")
        socket.disconnect();
    }

    //update profile function to handle user profile
    /*const updateProfile = async (body)=>{
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if(data.success){
                setauthUser(data.user);
                toast.success("Profile Updated Successfully");
            }
        } catch (error) {
            console.error(error.response || error);
            toast.error(error.message)
        }
    }*/
    const updateProfile = async (body) => {
        try {
          const { data } = await axios.put("/api/auth/update-profile", body, {
            headers: { token: localStorage.getItem("token") }  // ✅ matches backend
          });
      
          if (data.success) {
            setauthUser(data.user);
            toast.success("Profile Updated Successfully");
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          console.error("API error:", error.response || error);
          toast.error(error.message);
        }
      };



    //connect socket function to handle socket connection and online users updates
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setsocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds)=>{
            setonlineUsers(userIds);
        })
    }

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth()
    },[])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}