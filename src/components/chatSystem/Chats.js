import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiMessageCircle } from 'react-icons/fi';
import ChatList from './ChatList';
import ChatDetail from './ChatDetail';
import './ChatStyles.css';

const Chats = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('Chats');
  
  // Fix the selectors to match the actual Redux store structure
  const admin = useSelector(state => state.adminAuthorLoginSlice.currentAdmin);
  const doctor = useSelector(state => state.doctorAuthorLoginSlice.currentDoctor);
  
  // Determine if user is authenticated
  const isAuthenticated = !!admin?.FirstName || !!doctor?.FirstName;
  
  useEffect(() => {
    // Set the title based on the current route
    if (location.pathname === '/chats') {
      setTitle('Chats');
    } else if (location.pathname.startsWith('/chat/')) {
      setTitle('Chat Details');
    }
  }, [location.pathname]);
  
  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return (
      <div className="chats-container" style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p>Please log in to access chats.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chats-container" style={{ padding: '20px' }}>
      <div className="chats-header" style={{ marginBottom: '20px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiMessageCircle /> {title}
        </h1>
      </div>
      
      <Routes>
        <Route path="/" element={<ChatList />} />
        <Route path="/:chatId" element={<ChatDetail />} />
      </Routes>
    </div>
  );
};

export default Chats; 