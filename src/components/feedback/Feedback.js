import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './Feedback.css';
import { ApiUrlContext } from '../../App';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    categoryAverages: {}
  });
  
  const apiUrl = useContext(ApiUrlContext);
  
  // Get the current user from Redux store with CORRECT SLICE NAMES
  const admin = useSelector(state => state.adminAuthorLoginSlice?.currentAdmin);
  const doctor = useSelector(state => state.doctorAuthorLoginSlice?.currentDoctor);
  
  // Also check isLogin flags
  const isAdminLoggedIn = useSelector(state => state.adminAuthorLoginSlice?.isLoginAdmin);
  const isDoctorLoggedIn = useSelector(state => state.doctorAuthorLoginSlice?.isLoginDoctor);
  
  // Check if user is authenticated
  const isAdmin = isAdminLoggedIn && admin && Object.keys(admin).length > 0;
  const isDoctor = isDoctorLoggedIn && doctor && Object.keys(doctor).length > 0;

  // Debug info
  console.log("Admin state:", admin, "isAdminLoggedIn:", isAdminLoggedIn);
  console.log("Doctor state:", doctor, "isDoctorLoggedIn:", isDoctorLoggedIn);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        let response;
        
        if (isAdmin) {
          // Admin sees all feedback
          response = await axios.get(`${apiUrl}/feedback-api/all-feedback`);
        } else if (isDoctor) {
          // Doctor sees only their feedback
          const doctorId = doctor._id;
          response = await axios.get(`${apiUrl}/feedback-api/doctor/${doctorId}`);
        } else {
          // Default to showing all feedback if not authenticated
          setError('User authentication required');
          setLoading(false);
          return;
        }
        
        if (response.data && (response.data.feedbacks || response.data.feedback)) {
          const feedbackData = response.data.feedbacks || response.data.feedback;
          setFeedbacks(feedbackData);
          calculateStats(feedbackData);
        } else {
          setFeedbacks([]);
          setError('No feedback data available');
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('An error occurred while fetching feedback data');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [isAdmin, isDoctor, doctor, apiUrl]);

  const calculateStats = (feedbackData) => {
    if (!feedbackData || feedbackData.length === 0) {
      setStats({
        total: 0,
        averageRating: 0,
        categoryAverages: {}
      });
      return;
    }

    const total = feedbackData.length;
    
    // Calculate overall average
    let overallSum = 0;
    feedbackData.forEach(feedback => {
      if (feedback.ratings && feedback.ratings.overall) {
        overallSum += parseFloat(feedback.ratings.overall);
      }
    });
    
    // Calculate category averages
    const categories = ['punctuality', 'communication', 'treatment', 'care', 'facilities'];
    const categoryTotals = {};
    const categoryCounts = {};
    
    categories.forEach(category => {
      categoryTotals[category] = 0;
      categoryCounts[category] = 0;
    });
    
    feedbackData.forEach(feedback => {
      if (feedback.ratings) {
        categories.forEach(category => {
          if (feedback.ratings[category]) {
            categoryTotals[category] += parseFloat(feedback.ratings[category]);
            categoryCounts[category]++;
          }
        });
      }
    });
    
    const categoryAverages = {};
    categories.forEach(category => {
      categoryAverages[category] = categoryCounts[category] > 0 
        ? (categoryTotals[category] / categoryCounts[category]).toFixed(1) 
        : 0;
    });
    
    setStats({
      total,
      averageRating: total > 0 ? (overallSum / total).toFixed(1) : 0,
      categoryAverages
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    return (
      <div className="star-display">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={
            i < fullStars 
              ? "star full" 
              : (i === fullStars && hasHalfStar) 
                ? "star half" 
                : "star empty"
          }>
            {i < fullStars || (i === fullStars && hasHalfStar) ? "★" : "☆"}
          </span>
        ))}
        <span className="rating-value">{rating}</span>
      </div>
    );
  };

  return (
    <div className="feedback-container">
      <h2>
        {isAdmin ? 'All Patient Feedback' : 'Your Patient Feedback'}
      </h2>
      
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading feedback data...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="feedback-summary">
            <div className="feedback-stats">
              <div className="stat-item">
                <h3>Total Feedback</h3>
                <div className="stat-value">{stats.total}</div>
              </div>
              
              <div className="stat-item">
                <h3>Overall Rating</h3>
                <div className="stat-rating">
                  {renderStars(stats.averageRating)}
                </div>
              </div>
            </div>
            
            <div className="category-ratings">
              <h3>Category Ratings</h3>
              <div className="category-grid">
                <div className="category-item">
                  <span>Punctuality</span>
                  {renderStars(stats.categoryAverages.punctuality || 0)}
                </div>
                
                <div className="category-item">
                  <span>Communication</span>
                  {renderStars(stats.categoryAverages.communication || 0)}
                </div>
                
                <div className="category-item">
                  <span>Treatment</span>
                  {renderStars(stats.categoryAverages.treatment || 0)}
                </div>
                
                <div className="category-item">
                  <span>Care & Attention</span>
                  {renderStars(stats.categoryAverages.care || 0)}
                </div>
                
                <div className="category-item">
                  <span>Facilities</span>
                  {renderStars(stats.categoryAverages.facilities || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="feedback-list">
            <h3>Recent Feedback</h3>
            {feedbacks.length === 0 ? (
              <div className="no-feedback">
                <p>No feedback received yet.</p>
              </div>
            ) : (
              <table className="feedback-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    {isAdmin && <th>Doctor</th>}
                    <th>Department</th>
                    <th>Date</th>
                    <th>Rating</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map((feedback) => (
                    <tr key={feedback._id}>
                      <td>{feedback.patientName}</td>
                      {isAdmin && <td>{feedback.doctorName}</td>}
                      <td>{feedback.department}</td>
                      <td>{formatDate(feedback.date || feedback.createdAt)}</td>
                      <td className="rating-cell">
                        {renderStars(feedback.ratings?.overall || 0)}
                      </td>
                      <td className="comments-cell">
                        {feedback.comments || 'No comments provided'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Feedback; 