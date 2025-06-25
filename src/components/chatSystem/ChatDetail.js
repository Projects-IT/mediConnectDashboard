import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  FiArrowLeft, FiSend, FiPaperclip, FiCheck, FiCheckCircle, 
  FiInfo, FiUser, FiFile, FiDownload
} from 'react-icons/fi';
import FAQPanel from './FAQPanel';
import './ChatStyles.css';
import { ApiUrlContext } from '../../App';

const socket = io('https://mediconnetbackend.onrender.com');

const ChatDetail = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showFAQ, setShowFAQ] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Typing indicator state
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState('');
  const typingTimeoutRef = useRef(null);
  
  const apiUrl = useContext(ApiUrlContext);
  
  const { isLoginAdmin, currentAdmin } = useSelector(state => state.adminAuthorLoginSlice);
  const { isLoginDoctor, currentDoctor } = useSelector(state => state.doctorAuthorLoginSlice);

  const userType = isLoginAdmin ? 'admin' : (isLoginDoctor ? 'doctor' : null);
  const userId = isLoginAdmin ? currentAdmin._id : (isLoginDoctor ? currentDoctor._id : null);
  const userName = isLoginAdmin ? currentAdmin.FirstName : (isLoginDoctor ? `${currentDoctor.FirstName} ${currentDoctor.LastName}` : '');

  useEffect(() => {
    if (!chatId || !userId) {
      navigate('/chats');
      return;
    }

    socket.emit('joinChat', chatId);

    socket.on('newMessage', (newMessageData) => {
      if (newMessageData.chatId === chatId) {
        setMessages(prevMessages => [...prevMessages, newMessageData.dbMessage]);
        // When a new message arrives, the other user is no longer typing
        setIsTyping(false); 
      }
    });

    socket.on('typing', ({ userName: remoteUserName }) => {
        setTypingUserName(remoteUserName);
        setIsTyping(true);
    });

    socket.on('stopTyping', () => {
        setIsTyping(false);
    });

    fetchChatDetailsAndMessages();
    markMessagesAsRead();

    return () => {
      socket.off('newMessage');
      socket.off('typing');
      socket.off('stopTyping');
      socket.emit('leaveChat', chatId);
    };
  }, [chatId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchChatDetailsAndMessages = async () => {
    setLoading(true);
    try {
      const chatDetailsResponse = await axios.get(`${apiUrl}/chat-api/chats/user/${userId}?userType=${userType}`);
      const foundChat = chatDetailsResponse.data.chats.find(c => c._id === chatId);
      
      if (foundChat) {
        setChat(foundChat);
        if (foundChat.chatType === 'patient-admin' && userType === 'admin') {
            setShowFAQ(true);
        }
      } else {
        throw new Error("Chat not found");
      }

      const messagesResponse = await axios.get(`${apiUrl}/chat-api/chats/${chatId}/messages`);
      setMessages(messagesResponse.data.messages || []);

    } catch (err) {
      console.error("Error fetching chat data:", err);
      setError("Failed to load chat. It might not exist or you may not have access.");
      setChat(null); // Ensure no stale chat data is shown
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await axios.put(`${apiUrl}/chat-api/chats/${chatId}/read`, { userId, userType });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socket) {
      if (e.target.value && !typingTimeoutRef.current) {
        socket.emit('startTyping', { chatId, userName });
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { chatId });
        typingTimeoutRef.current = null;
      }, 3000); // 3 seconds of inactivity
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);

    const messageData = {
      senderId: userId,
      senderType: userType,
      message: newMessage.trim(),
      messageType: 'text',
      chatId: chatId
    };

    // --- Optimistic UI Update ---
    // The message is now added via socket broadcast for a single source of truth
    setNewMessage(''); 
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
    }
    socket.emit('stopTyping', { chatId });
    
    try {
      // The API call saves the message and triggers the broadcast from the server
      await axios.post(`${apiUrl}/chat-api/chats/${chatId}/message`, messageData);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      // Restore the message if the API call fails
      setNewMessage(messageData.message); 
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }
    setSending(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', userId);
    formData.append('senderType', userType);
    formData.append('chatId', chatId);
    formData.append('fileName', file.name);
    formData.append('messageType', file.type.startsWith('image/') ? 'image' : 'document');

    try {
        await axios.post(`${apiUrl}/chat-api/upload-and-send`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    } catch (err) {
        console.error("Error uploading file:", err);
        setError("Failed to upload file");
    } finally {
        setSending(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const formatMessageTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const groupMessagesByDate = () => {
    if (!messages) return [];
    return messages.reduce((acc, msg) => {
      const date = new Date(msg.timestamp).toDateString();
      const group = acc.find(g => g.date === date);
      if (group) {
        group.messages.push(msg);
      } else {
        acc.push({ date, messages: [msg] });
      }
      return acc;
    }, []);
  };
  
  const formatHeaderDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const renderMessageContent = (message) => {
    switch (message.messageType) {
      case 'image':
        return <img src={message.message} alt={message.fileName || "Shared image"} className="message-image"/>;
      case 'document':
        return (
          <div className="document-container">
            <FiFile className="doc-icon" />
            <div className="doc-details">
              <span>{message.fileName || 'Document'}</span>
              <a href={message.message} target="_blank" rel="noopener noreferrer" className="doc-download-link">
                <FiDownload /> Download
              </a>
            </div>
          </div>
        );
      default:
        return message.message;
    }
  };

  if (loading) return <div className="chat-detail-container"><div className="loading-spinner"></div></div>;
  if (error) return <div className="chat-detail-container"><div className="error-message">{error}</div></div>;
  if (!chat) return <div className="chat-detail-container"><div className="error-message">Select a chat to start messaging.</div></div>;
  
  const otherParticipant = chat.otherParticipants[0];
  const displayName = otherParticipant?.userType === 'admin' ? 'Admin' : otherParticipant?.name || 'Unknown User';
  const messageGroups = groupMessagesByDate();

  return (
    <div className="chat-container">
      <div className="chat-detail-container">
        <div className="chat-detail-header">
           <button className="action-button back-button" onClick={() => navigate('/chats')}><FiArrowLeft /></button>
            <div className="chat-avatar">
                {otherParticipant?.profilePicture ? <img src={otherParticipant.profilePicture} alt={displayName} /> : <div className="avatar-placeholder"><FiUser /></div>}
            </div>
            <div className="chat-detail-info">
                <h3 className="chat-detail-name">{displayName}</h3>
                {otherParticipant?.userType === 'doctor' && <span className="doctor-specialization">{otherParticipant.specialization}</span>}
            </div>
            <div className="chat-detail-actions">
              {userType === 'admin' && <button className="action-button" onClick={() => setShowFAQ(!showFAQ)} title="Toggle FAQ Panel"><FiInfo /></button>}
            </div>
        </div>
        
        <div className="chat-messages">
          {messageGroups.map((group) => (
            <React.Fragment key={group.date}>
              <div className="message-date"><span>{formatHeaderDate(group.date)}</span></div>
              {group.messages.map((message) => (
                <div key={message._id} className={`message ${message.senderId === userId ? 'outgoing' : 'incoming'}`}>
                  <div className="message-content">{renderMessageContent(message)}</div>
                  <div className="message-meta">
                    <span className="message-time">{formatMessageTime(message.timestamp)}</span>
                    {message.senderId === userId && (
                      <span className="message-status">
                        {message.isRead ? <FiCheckCircle className="status-icon read" /> : <FiCheck className="status-icon sent" />}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
          <div className="typing-indicator-container">
            {isTyping && <p className="typing-indicator">{typingUserName} is typing...</p>}
          </div>
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-container">
          <button className="input-button" onClick={() => fileInputRef.current?.click()} disabled={sending}><FiPaperclip /></button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
          <textarea
            className="chat-input"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={sending}
          />
          <button className="send-button" onClick={handleSendMessage} disabled={!newMessage.trim() || sending}><FiSend /></button>
        </div>
      </div>
      
      {showFAQ && userType === 'admin' && (
        <FAQPanel onSelectFAQ={(faq) => setNewMessage(faq.answer)} />
      )}
    </div>
  );
};

export default ChatDetail; 