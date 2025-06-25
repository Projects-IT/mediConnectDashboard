import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiSearch, FiMessageCircle, FiUser, FiClock, FiAlertCircle } from 'react-icons/fi';
import { RiAdminFill } from 'react-icons/ri';
import './ChatStyles.css';
import { ApiUrlContext } from '../../App';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'patient', 'doctor'
  
  const apiUrl = useContext(ApiUrlContext);
  const admin = useSelector(state => state.adminAuthorLoginSlice.currentAdmin);
  const doctor = useSelector(state => state.doctorAuthorLoginSlice.currentDoctor);
  
  // Determine user type and ID
  const userType = admin?.FirstName ? 'admin' : doctor?.FirstName ? 'doctor' : null;
  const userId = admin?.FirstName ? admin._id : doctor?.FirstName ? doctor._id : null;

  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId, userType]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      console.log(`Fetching chats for user: ${userId}, type: ${userType}`);
      const response = await axios.get(`${apiUrl}/chat-api/chats/user/${userId}?userType=${userType}`);
      
      if (response.data.message === "Chats retrieved successfully") {
        setChats(response.data.chats);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError("Failed to load chats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Within a week - show day name
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older - show date
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  };

  const getFilteredChats = () => {
    let filtered = chats;
    
    // Filter by chat type if tab is selected
    if (activeTab === 'patient') {
      filtered = chats.filter(chat => chat.chatType === 'patient-admin');
    } else if (activeTab === 'doctor') {
      filtered = chats.filter(chat => chat.chatType === 'admin-doctor');
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(chat => {
        // Search in participant names
        const participantMatch = chat.otherParticipants?.some(participant => 
          participant.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Search in last message
        const messageMatch = chat.lastMessage?.message?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return participantMatch || messageMatch;
      });
    }
    
    // Sort by latest message
    return filtered.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  };

  if (loading) {
    return (
      <div className="chat-list-container">
        <div className="chat-list-header">
          <h2>Chats</h2>
          <p>Loading chats...</p>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-list-container">
        <div className="chat-list-header">
          <h2>Chats</h2>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  const filteredChats = getFilteredChats();

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h2>Chats</h2>
        <div className="search-container">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
      
      {userType === 'admin' && (
        <div className="chat-tabs">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} 
            onClick={() => setActiveTab('all')}
          >
            All Chats
          </button>
          <button 
            className={`tab-button ${activeTab === 'patient' ? 'active' : ''}`} 
            onClick={() => setActiveTab('patient')}
          >
            Patient Chats
          </button>
          <button 
            className={`tab-button ${activeTab === 'doctor' ? 'active' : ''}`} 
            onClick={() => setActiveTab('doctor')}
          >
            Doctor Chats
          </button>
        </div>
      )}
      
      <div className="chat-list">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatItem key={chat._id} chat={chat} />
          ))
        ) : (
          <div className="no-chats-message">
            {searchTerm ? (
              <p>No chats match your search criteria.</p>
            ) : (
              <p>
                <FiMessageCircle className="empty-icon" />
                No chats found. 
                {userType === 'admin' 
                  ? ' Patient and doctor chats will appear here.' 
                  : ' Your conversations will appear here.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatItem = ({ chat }) => {
  const { isLoginAdmin, currentAdmin } = useSelector(state => state.adminAuthorLoginSlice);
  const { isLoginDoctor, currentDoctor } = useSelector(state => state.doctorAuthorLoginSlice);
  const userId = isLoginAdmin ? currentAdmin._id : (isLoginDoctor ? currentDoctor._id : null);

  const otherParticipant = chat.otherParticipants.find(p => p.userId !== userId);
  const displayName = otherParticipant?.userType === 'admin' ? 'Admin' : otherParticipant?.name || 'Unknown User';
  
  const formatTime = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return null;

    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  let lastMessageText = chat.lastMessage || '';

  if (lastMessageText.length > 30) {
    lastMessageText = `${lastMessageText.substring(0, 30)}...`;
  }
  
  const timeToDisplay = formatTime(chat.lastMessageTimestamp) || 'New Chat';
  
  const isUnread = chat.unreadCount > 0;

  return (
    <Link to={`/chats/${chat._id}`} className="chat-item">
      <div className="chat-avatar">
        {otherParticipant?.profilePicture ? (
          <img src={otherParticipant.profilePicture} alt={displayName} />
        ) : (
          <div className="avatar-placeholder">
            {otherParticipant?.userType === 'admin' ? <RiAdminFill /> : <FiUser />}
          </div>
        )}
      </div>
      <div className="chat-details">
        <div className="chat-top-row">
          <h4 className="chat-name">{displayName}</h4>
          <span className="chat-time">
            <FiClock className="time-icon" />
            {timeToDisplay}
          </span>
        </div>
        <div className="chat-bottom-row">
          <p className="chat-last-message">
            {lastMessageText || <i>No messages yet</i>}
          </p>
          
          {isUnread && (
            <div className="unread-badge">New</div>
          )}
        </div>
        
        {otherParticipant?.userType === 'doctor' && (
          <div className="chat-meta">
            <span className="doctor-specialization">
              {otherParticipant.specialization || 'Doctor'}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ChatList; 