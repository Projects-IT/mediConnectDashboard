import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FiPlus, FiMinus, FiSearch, FiSave, FiXCircle } from 'react-icons/fi';
import './ChatStyles.css';
import { ApiUrlContext } from '../../App';

const AddFAQForm = ({ onAdd, onCancel, categories }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [targetAudience, setTargetAudience] = useState('patient');
    const apiUrl = useContext(ApiUrlContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalCategory = newCategory || category;
        if (!question || !answer || !finalCategory) {
            alert("Please fill all fields.");
            return;
        }
        
        try {
            await axios.post(`${apiUrl}/chat-api/faq`, {
                question,
                answer,
                category: finalCategory,
                targetAudience
            });
            onAdd(); // Callback to refresh FAQ list and hide form
        } catch (error) {
            console.error("Failed to add FAQ:", error);
            alert("Failed to add FAQ. See console for details.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-faq-form">
            <h4>Add New FAQ</h4>
            <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} required>
                <option value="patient">For Patients</option>
                <option value="doctor">For Doctors</option>
                <option value="all">For All</option>
            </select>
            <input type="text" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
            <textarea placeholder="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
            <select value={category} onChange={(e) => { setCategory(e.target.value); setNewCategory(''); }} required={!newCategory}>
                <option value="">Select Category or Add New</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="text" placeholder="Or add new category" value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setCategory(''); }} />
            <div className="form-actions">
                <button type="submit" className="action-btn save"><FiSave /> Save</button>
                <button type="button" className="action-btn cancel" onClick={onCancel}><FiXCircle /> Cancel</button>
            </div>
        </form>
    );
};

const FAQPanel = ({ onSelectFAQ }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const apiUrl = useContext(ApiUrlContext);
  
  useEffect(() => {
    fetchFAQs();
  }, []);
  
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/chat-api/faq`, { params: { audience: 'all' }});
      
      if (response.data.faqs) {
        setFaqs(response.data.faqs);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.faqs.map(faq => faq.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setError("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFaqClick = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setExpandedFaq(null);
  };
  
  const handleSelectFAQ = (faq) => {
    if (onSelectFAQ) {
      onSelectFAQ(faq);
    }
  };
  
  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchFAQs(); // Refresh the list
  };
  
  const getFilteredFaqs = () => {
    return faqs.filter(faq => {
      // Filter by category
      const categoryMatch = selectedCategory === 'all' || faq.category === selectedCategory;
      
      // Filter by search term
      const searchMatch = !searchTerm || 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        
      return categoryMatch && searchMatch;
    });
  };
  
  if (loading) {
    return (
      <div className="faq-panel">
        <div className="faq-header">
          <h3 className="faq-title">FAQ</h3>
          <p className="faq-description">Loading FAQs...</p>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="faq-panel">
        <div className="faq-header">
          <h3 className="faq-title">FAQ</h3>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }
  
  const filteredFaqs = getFilteredFaqs();
  
  return (
    <div className="faq-panel">
      <div className="faq-header">
        <h3 className="faq-title">FAQ Management</h3>
        <p className="faq-description">
          Use existing FAQs or add new ones.
        </p>
      </div>
      
      {!showAddForm && (
        <button className="add-faq-toggle" onClick={() => setShowAddForm(true)}>
            <FiPlus /> Add New FAQ
        </button>
      )}

      {showAddForm && <AddFAQForm onAdd={handleAddSuccess} onCancel={() => setShowAddForm(false)} categories={categories} />}
      
      <div className="search-container" style={{ margin: '15px 0' }}>
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search FAQs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {categories.length > 0 && (
        <div className="category-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
          <button 
            className={`category-button ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategorySelect('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '15px',
              fontSize: '12px',
              fontWeight: '500',
              border: 'none',
              background: selectedCategory === 'all' ? '#3498db' : '#e8f4fd',
              color: selectedCategory === 'all' ? 'white' : '#3498db',
              cursor: 'pointer'
            }}
          >
            All
          </button>
          
          {categories.map(category => (
            <button 
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category)}
              style={{
                padding: '6px 12px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: '500',
                border: 'none',
                background: selectedCategory === category ? '#3498db' : '#e8f4fd',
                color: selectedCategory === category ? 'white' : '#3498db',
                cursor: 'pointer'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      
      <div className="faq-list">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map(faq => (
            <div key={faq._id} className="faq-item">
              <button 
                className="faq-question"
                onClick={() => handleFaqClick(faq._id)}
              >
                {faq.question}
                {expandedFaq === faq._id ? <FiMinus /> : <FiPlus />}
              </button>
              
              <div className={`faq-answer ${expandedFaq === faq._id ? 'open' : ''}`}>
                <p className="faq-text">{faq.answer}</p>
                <span className="faq-category">{faq.category}</span>
                
                <button 
                  onClick={() => handleSelectFAQ(faq)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    marginTop: '10px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#3498db',
                    color: 'white',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Use This Answer
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-faqs-message" style={{ textAlign: 'center', color: '#8896ab', padding: '20px 0' }}>
            {searchTerm ? (
              <p>No FAQs match your search criteria.</p>
            ) : (
              <p>No FAQs available in this category.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQPanel; 