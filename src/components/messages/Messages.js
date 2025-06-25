import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { FiMail, FiClock, FiTag, FiChevronRight, FiSearch } from 'react-icons/fi';
import MessageDetail from './MessageDetail';
import './Messages.css';
import { ApiUrlContext } from '../../App';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const apiUrl = useContext(ApiUrlContext);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/patient-api/messages`);
      if (response.data.message === "Messages retrieved successfully") {
        setMessages(response.data.messages);
      }
    } catch (err) {
      setError('Failed to fetch messages. Please try again.');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  };

  const handleReadMore = (message) => {
    setSelectedMessage(message);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeMessageDetail = () => {
    setSelectedMessage(null);
    // Restore scrolling
    document.body.style.overflow = 'auto';
  };

  // Filter messages based on search term
  const filteredMessages = messages.filter(message => 
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close message detail on escape key press
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && selectedMessage) {
        closeMessageDetail();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [selectedMessage]);

  if (loading) {
    return (
      <div className="messages-page">
        <div className="messages-header">
          <h1>Messages</h1>
          <p>Loading messages...</p>
        </div>
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-page">
        <div className="messages-header">
          <h1>Messages</h1>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-header">
        <div>
          <h1>Messages</h1>
          <p>View all messages from patients</p>
        </div>
        <div className="search-container">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="messages-container">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <div key={message._id} className="message-card">
              <div className="message-header">
                <div className="message-sender">
                  <h3>{message.name}</h3>
                  <span className="message-email">
                    <FiMail className="icon" /> {message.email}
                  </span>
                </div>
                <div className="message-date">
                  <FiClock className="icon" /> {formatDate(message.createdAt)}
                </div>
              </div>
              <div className="message-subject">
                <FiTag className="icon" /> {message.subject}
              </div>
              <div className="message-content">
                <p className="message-text">{truncateText(message.message)}</p>
                {message.message && message.message.length > 100 && (
                  <button
                    className="read-more-btn"
                    onClick={() => handleReadMore(message)}
                    aria-label="Read full message"
                  >
                    Read more <FiChevronRight />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">
            {searchTerm ? (
              <p>No messages found matching your search criteria.</p>
            ) : (
              <p>No messages found. Messages from patients will appear here.</p>
            )}
          </div>
        )}
      </div>

      {selectedMessage && (
        <MessageDetail 
          message={selectedMessage}
          onClose={closeMessageDetail}
        />
      )}
    </div>
  );
}

export default Messages; 

