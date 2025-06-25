import React, { createContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./components/dashBoard/Dashboard";
// import { Context } from "./main";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/sidebar/Sidebar";
import "./App.css";
import AddNewAdmin from "./components/addNewAdmin/AddNewAdmin";
import AddNewDoctor from "./components/addnewDoctor/AddNewDoctor";
import Doctors from "./components/doctor/Doctor";
import DoctorDetail from "./components/doctor/DoctorDetail";
import Login from "./components/login/Login";
import DocterRequest from "./components/docterRequest/DocterRequest";
import Settings from "./components/settings/Settings";
import UserType from "./components/userType/UserType";
import { pdfjs } from 'react-pdf';
import Appointments from "./components/appointments/Appointments";
import Messages from "./components/messages/Messages";
import Feedback from "./components/feedback/Feedback";
import Chats from "./components/chatSystem/Chats";
// import Chats from "./components/chatSystem/Chats";

// Create API URL context
export const ApiUrlContext = createContext();
const API_URL = "https://mediconnetbackend.onrender.com";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Sidebar />}
      {isLoginPage ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      ) : (
        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/doctor/addnew" element={<AddNewDoctor />} />
            <Route path="/admin/addnewdoctor" element={<AddNewDoctor />} />
            <Route path="/doctor/settings" element={<Settings />} />
            <Route path="/admin/addnew" element={<AddNewAdmin />} />
            <Route path="/admin/docterRequest" element={<DocterRequest />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/doctor/appointments" element={<Appointments />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctor-details/:id" element={<DoctorDetail />} />
            <Route path="/feedback" element={<Feedback />} />
            {/* Chat System Routes */}
            <Route path="/chats/*" element={<Chats />} />
          </Routes>
        </main>
      )}
      <ToastContainer position="top-center" />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <ApiUrlContext.Provider value={API_URL}>
        <AppContent />
      </ApiUrlContext.Provider>
    </Router>
  );
};

export default App;
