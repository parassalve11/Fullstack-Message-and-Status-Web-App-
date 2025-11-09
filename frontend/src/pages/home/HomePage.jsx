import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import ChatList from "../chat/ChatList";
import { motion as Motion } from "framer-motion";
import { getAllUsers } from "../../api/user";
function HomePage() {




  const [allUser, setAllUser] = useState([]);

  const getAllUser = async () => {
    try {
      const res = await getAllUsers();

      if (res.status === "success") {
        setAllUser(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() =>{
    getAllUser()
  },[])

  
  


  return (
    <Layout>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <ChatList contacts={allUser}  />
      </Motion.div>
    </Layout>
  );
}

export default HomePage;
