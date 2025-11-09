import React, { useContext, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext)

  return (
    <div className="flex items-center justify-center w-full h-screen sm:px-[15%] sm:py-[5%]">
  <div className={`backdrop-blur-xl border border-gray-600/50 rounded-2xl overflow-hidden w-full
   h-full grid grid-cols-1 relative bg-transparent ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
    <Sidebar />
    <ChatContainer />
    <RightSidebar />
  </div>
</div>
  )
}

export default HomePage
