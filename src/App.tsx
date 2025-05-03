import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Tabs from "./components/Tabs";
import Login from "./components/Login"; // Import the Login page
import CandidateLogin from "./components/CandidateLogin";
import CandidateRegister from "./components/CandidateRegister";
import RecruiterRegister from "./components/RecruiterRegister";
import RecruiterLogin from "./components/RecruiterLogin";
import CandidateView from "./components/CandidateView";
import MyProfile from "./components/MyProfile";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Default route to Login */}
        <Route path="/candidatelogin" element={<CandidateLogin/>} />
        <Route path="/candidateregister" element={<CandidateRegister/>} />
        <Route path="/recruiterregister" element={<RecruiterRegister/>} />
        <Route path="/recruiterlogin" element={<RecruiterLogin/>} />
        <Route path="/candidateview" element={<CandidateView/>} />
        <Route path="/myProfile" element={<MyProfile/>} />
        <Route path="/candidatedashboard" element={<Tabs />} /> {/* Dashboard with Tabs */}
      </Routes>
    </Router>
  );
};

export default App;
