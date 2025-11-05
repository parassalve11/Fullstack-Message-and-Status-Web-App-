
import React from "react"
import {BrowserRouter as Router,Routes,Route, BrowserRouter} from 'react-router-dom'
import Login from "./pages/user-login/Login"
import { ProtectedRoute, PublicRoute } from "./ProtectedRoute"
import HomePage from "./pages/home/HomePage"
import UserDetails from "./pages/user-profile/userDetails"
import StatusPage from "./pages/status/StatusPage"




function App() {
 

  return (
    <Router>
      <Routes>
        //public routes
        <Route element={<PublicRoute/>}  >

          <Route path="/user-login" element={<Login />} />
        </Route>
      //protected routes
      <Route element={<ProtectedRoute />}>
        <Route path='/' element={<HomePage />} />
        <Route path='/user-profile' element={<UserDetails />} />
        <Route path='/status' element={<StatusPage />} />
      </Route>

        
      </Routes>
    </Router>
  )
}

export default App
