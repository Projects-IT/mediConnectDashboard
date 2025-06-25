import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiXCircle } from 'react-icons/fi';
import { ApiUrlContext } from '../../App';
import './FAQManagement.css'; // We will create this CSS file

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentFaq, setCurrentFaq] = useState({ question: '', answer: '', category: '', targetAudience: 'patient' });
  const apiUrl = useContext(ApiUrlContext);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      // Fetch all FAQs, without audience filter
      const response = await axios.get(`${apiUrl}/chat-api/faq`);
      setFaqs(response.data.faqs);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch FAQs.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentFaq(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const method = editingId ? 'put' : 'post';
    const url = editingId ? `${apiUrl}/chat-api/faq/${editingId}` : `${apiUrl}/chat-api/faq`;
    
    try {
      await axios[method](url, currentFaq);
      fetchFaqs();
      setEditingId(null);
      setIsAdding(false);
      setCurrentFaq({ question: '', answer: '', category: '', targetAudience: 'patient' });
    } catch (err) {
      setError('Failed to save FAQ.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        // We need a DELETE endpoint, for now, we'll just deactivate it.
        await axios.put(`${apiUrl}/chat-api/faq/${id}`, { isActive: false });
        fetchFaqs();
      } catch (err) {
        setError('Failed to delete FAQ.');
      }
    }
  };

  const startEdit = (faq) => {
    setEditingId(faq._id);
    setCurrentFaq(faq);
  };
  
  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setCurrentFaq({ question: '', answer: '', category: '', targetAudience: 'patient' });
  };

  const renderFaqForm = () => (
    <div className="faq-form">
      <input type="text" name="question" value={currentFaq.question} onChange={handleInputChange} placeholder="Question" />
      <textarea name="answer" value={currentFaq.answer} onChange={handleInputChange} placeholder="Answer"></textarea>
      <input type="text" name="category" value={currentFaq.category} onChange={handleInputChange} placeholder="Category (e.g., General, Appointments)" />
      <select name="targetAudience" value={currentFaq.targetAudience} onChange={handleInputChange}>
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="all">All</option>
      </select>
      <div className="form-actions">
        <button onClick={handleSave}><FiSave /> Save</button>
        <button onClick={cancelEdit} className="cancel-btn"><FiXCircle /> Cancel</button>
      </div>
    </div>
  );

  return (
    <div className="faq-management-container">
      <div className="faq-header">
        <h1>FAQ Management</h1>
        {!isAdding && !editingId && (
          <button onClick={() => { setIsAdding(true); }} className="add-btn"><FiPlus /> Add New FAQ</button>
        )}
      </div>

      {(isAdding || editingId) && renderFaqForm()}

      {loading && <p>Loading FAQs...</p>}
      {error && <p className="error-message">{error}</p>}
      
      <div className="faq-list">
        {faqs.map(faq => (
          <div key={faq._id} className="faq-item">
            <div className="faq-content">
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
              <div className="faq-meta">
                <span>Category: {faq.category}</span>
                <span>Audience: {faq.targetAudience}</span>
              </div>
            </div>
            <div className="faq-actions">
              <button onClick={() => startEdit(faq)}><FiEdit /></button>
              <button onClick={() => handleDelete(faq._id)}><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQManagement; 