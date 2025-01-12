import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import CompanyDashboard from "./CompanyDashboard";
import UserDashboard from "./UserDashboard";
import UserOldChats from "./UserOldChats";  

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth/company" element={<Login userType="Company" />} />
        <Route path="/auth/user" element={<Login userType="User" />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path='/userOldchats' element={<UserOldChats />} />
      </Routes>
    </Router>
  );
};

export default App;
