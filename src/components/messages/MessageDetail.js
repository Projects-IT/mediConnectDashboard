import React, { useEffect, useRef } from 'react';
import { FiX, FiClock, FiMail, FiTag, FiUser } from 'react-icons/fi';
import './Messages.css';

const MessageDetail = ({ message, onClose }) => {
  const detailRef = useRef(null);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (detailRef.current && !detailRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!message) return null;

  return (
    <div className="message-detail-overlay">
      <div className="message-detail-container" ref={detailRef}>
        <button className="close-btn" onClick={onClose} aria-label="Close message">
          <FiX />
        </button>
        
        <div className="message-detail-header">
          <h2>Message Details</h2>
        </div>
        
        <div className="message-detail-content">
          <div className="detail-section">
            <div className="detail-label">From</div>
            <div className="detail-value">
              <FiUser className="icon" />
              {message.name}
              <span className="email-detail">
                <FiMail className="icon" /> {message.email}
              </span>
            </div>
          </div>
          
          <div className="detail-section">
            <div className="detail-label">Subject</div>
            <div className="detail-value subject-detail">
              <FiTag className="icon" />
              {message.subject}
            </div>
          </div>
          
          <div className="detail-section">
            <div className="detail-label">Date</div>
            <div className="detail-value date-detail">
              <FiClock className="icon" />
              {formatDate(message.createdAt)}
            </div>
          </div>
          
          <div className="detail-section">
            <div className="detail-label">Message</div>
            <div className="content-detail">
              <p className="message-body">{message.message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail; 