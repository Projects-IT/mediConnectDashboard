import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFilePdf,
  FaTrash,
  FaSpinner,
  FaUserMd
} from "react-icons/fa";
import "./DoctorDetail.css";
import { ApiUrlContext } from "../../App";

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = useContext(ApiUrlContext);
  
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("appointments");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const defaultAvatarUrl = 'https://i.ibb.co/6JMzQrk/default-avatar.png';

  useEffect(() => {
    fetchDoctorData();
    fetchDoctorAppointments();
  }, [id]);

  const fetchDoctorData = async () => {
    try {
      console.log("Fetching doctor with ID:", id);
      const response = await axios.get(`${apiUrl}/doctor-api/doctor/${id}`);
      console.log("Doctor data:", response.data);
      setDoctor(response.data.doctor);
      setError(null);
    } catch (err) {
      console.error("Error fetching doctor details:", err);
      console.log("Response status:", err.response?.status);
      console.log("Response data:", err.response?.data);
      setError("Failed to fetch doctor details. Please try again later.");
      toast.error("Failed to fetch doctor details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorAppointments = async () => {
    try {
      // This should be updated to use doctor's ID or name based on your API
      const response = await axios.get(`${apiUrl}/patient-api/Appointments/${id}`);
      setAppointments(response.data.CurrentDoctorAppointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      // We don't set the main error state here to still show doctor details
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const showPdf = (pdf) => {
    window.open(`${apiUrl}/uploads/${pdf}`, "_blank", "noreferrer");
  };

  const handleAvatarError = (e) => {
    e.target.src = defaultAvatarUrl;
  };

  const openRemoveModal = () => {
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    setRemovalReason("");
  };

  const handleRemoveDoctor = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/doctor-api/remove/${id}`,
        { reason: removalReason }
      );
      
      if (response.data.message) {
        toast.success("Doctor removed successfully");
        closeRemoveModal();
        navigate("/doctors"); // Go back to doctors list
      }
    } catch (err) {
      console.error("Error removing doctor:", err);
      toast.error("Failed to remove doctor. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="doctor-detail-container">
        <div className="loading-spinner">
          <FaSpinner size={40} className="fa-spin" />
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="doctor-detail-container">
        <div className="doctor-detail-header">
          <button 
            className="back-button"
            onClick={() => navigate("/doctors")}
          >
            <FaArrowLeft /> Back to Doctors
          </button>
        </div>
        <div className="error-message">
          {error || "Doctor not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-detail-container">
      <div className="doctor-detail-header">
        <button 
          className="back-button"
          onClick={() => navigate("/doctors")}
        >
          <FaArrowLeft /> Back to Doctors
        </button>
        <h1 className="doctor-detail-title">
          Doctor Profile
        </h1>
      </div>

      <div className="doctor-detail-content">
        <div className="doctor-sidebar">
          <div className="doctor-avatar-container">
            <img
              src={doctor.avthar || defaultAvatarUrl}
              alt={`Dr. ${doctor.FirstName} ${doctor.LastName}`}
              className="doctor-avatar"
              onError={handleAvatarError}
            />
          </div>
          <div className="doctor-sidebar-info">
            <h2 className="doctor-name">{`Dr. ${doctor.FirstName} ${doctor.LastName}`}</h2>
            <p className="doctor-department">{doctor.department}</p>
            
            <div className="doctor-contact-info">
              <div className="doctor-contact-item">
                <FaEnvelope className="contact-icon" />
                <span>{doctor.email}</span>
              </div>
              <div className="doctor-contact-item">
                <FaPhone className="contact-icon" />
                <span>{doctor.mobile}</span>
              </div>
              {doctor.address && (
                <div className="doctor-contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <span>{doctor.address}</span>
                </div>
              )}
            </div>
            
            <div className="doctor-actions">
              {doctor.docs && (
                <button
                  className="btn-primary"
                  onClick={() => showPdf(doctor.docs)}
                >
                  <FaFilePdf /> View Document
                </button>
              )}
              <button
                className="btn-danger"
                onClick={openRemoveModal}
              >
                <FaTrash /> Remove Doctor
              </button>
            </div>
          </div>
        </div>
        
        <div className="main-content">
          <div className="content-card">
            <div className="doctor-tabs">
              <button
                className={`doctor-tab ${activeTab === "appointments" ? "active" : ""}`}
                onClick={() => handleTabChange("appointments")}
              >
                Appointments
              </button>
              <button
                className={`doctor-tab ${activeTab === "info" ? "active" : ""}`}
                onClick={() => handleTabChange("info")}
              >
                Additional Info
              </button>
            </div>
            
            <div className={`tab-content ${activeTab === "appointments" ? "active" : ""}`}>
              <div className="appointments-list">
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <div key={appointment._id} className="appointment-item">
                      <div className="appointment-date">
                        <FaCalendarAlt /> {appointment.dateOfAppointment}
                      </div>
                      <div className="appointment-patient">
                        {appointment.FirstName} {appointment.LastName}
                      </div>
                      <div className="appointment-reason">
                        {appointment.ReasonForVist}
                      </div>
                      <div className={`appointment-status status-${appointment.status?.toLowerCase() || "pending"}`}>
                        {appointment.status || "Pending"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-data-message">
                    No appointments found for this doctor.
                  </div>
                )}
              </div>
            </div>
            
            <div className={`tab-content ${activeTab === "info" ? "active" : ""}`}>
              <div className="content-card-header">
                <h3 className="content-card-title">Professional Information</h3>
              </div>
              
              <div>
                <p><strong>Registration Date:</strong> {new Date(doctor.createdAt || Date.now()).toLocaleDateString()}</p>
                <p><strong>Specialization:</strong> {doctor.department}</p>
                <p><strong>Experience:</strong> {doctor.experience || "Not specified"}</p>
                {doctor.education && <p><strong>Education:</strong> {doctor.education}</p>}
                {doctor.bio && <p><strong>Bio:</strong> {doctor.bio}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Doctor Modal */}
      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Remove Doctor</h2>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to remove Dr. {doctor?.FirstName}{" "}
                {doctor?.LastName}?
              </p>
              <p>
                This action will move the doctor to a deleted doctors collection. 
                They will no longer appear to patients, but their data will be preserved.
              </p>
              <div className="form-group">
                <label htmlFor="removalReason">
                  Reason for removal (optional):
                </label>
                <textarea
                  id="removalReason"
                  className="form-control"
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  rows="3"
                  placeholder="Please provide a reason for removing this doctor..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={closeRemoveModal}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleRemoveDoctor}
              >
                Remove Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetail; 
