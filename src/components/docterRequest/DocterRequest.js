import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiCheckCircle, FiXCircle, FiClock, FiRefreshCw, FiMessageSquare } from "react-icons/fi";
import './DocterRequest.css';
import { ApiUrlContext } from '../../App';

function DocterRequest() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showReturnMessage, setShowReturnMessage] = useState(false);
  const navigate = useNavigate();
  const apiUrl = useContext(ApiUrlContext);
  
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${apiUrl}/doctor-api/doctorsRequest`
      );
      setDoctors(data.doctors);
    } catch (err) {
      setError("Failed to fetch doctor requests");
      console.error("Error fetching doctor requests:", err);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchDoctors();
  }, []);

  async function handleUpdateStatus(id, status, doctor) {
    try {
      if (status === "Accepted") {
        await axios.post(`${apiUrl}/admin-api/doctor`, doctor);
        toast.success(`Dr. ${doctor.FirstName} ${doctor.LastName} has been accepted`);
      }
      if (status === "Rejected") {
        await axios.post(`${apiUrl}/admin-api/doctorReject`, doctor);
        toast.info(`Dr. ${doctor.FirstName} ${doctor.LastName} has been rejected`);
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to update doctor status");
      console.error("Error updating doctor status:", err);
    }
  }
  
  const showPdf = (pdf) => {
    window.open(`${apiUrl}/uploads/${pdf}`, "_blank", "noreferrer");
  };

  const openReturnMessage = (doctor) => {
    setSelectedDoctor(doctor);
    setShowReturnMessage(true);
  };

  const closeReturnMessage = () => {
    setSelectedDoctor(null);
    setShowReturnMessage(false);
  };
  
  if (loading) {
    return (
      <section className="doctors-request-section">
        <div className="card">
          <h1>Doctor Requests</h1>
          <div className="loading-state">Loading doctor requests...</div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="doctors-request-section">
        <div className="card">
          <h1>Doctor Requests</h1>
          <div className="error-state">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="doctors-request-section">
      <div className="card">
        <h1>Doctor Requests</h1>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Department</th>
                <th>Email</th>
                <th>Type</th>
                <th>Documents</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {doctors && doctors.length > 0
                ? doctors.map((doctor) => (
                    <tr key={doctor._id} className={doctor.isReturningDoctor ? "returning-doctor-row" : ""}>
                      <td data-label="Doctor">{`${doctor.FirstName} ${doctor.LastName}`}</td>
                      <td data-label="Department">{doctor.department}</td>
                      <td data-label="Email">{`${doctor.email}`}</td>
                      <td data-label="Type">
                        {doctor.isReturningDoctor ? (
                          <div className="returning-doctor-badge">
                            <FiRefreshCw className="returning-icon" />
                            <span>
                              {doctor.startedFresh ? "Returning (New)" : "Returning"}
                            </span>
                            {doctor.returnMessage && (
                              <button 
                                className="message-button"
                                onClick={() => openReturnMessage(doctor)}
                                title="View message from doctor"
                              >
                                <FiMessageSquare />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span>New</span>
                        )}
                      </td>
                      <td data-label="Documents">
                        <button 
                          type="button" 
                          className="doc-button"
                          onClick={() => showPdf(doctor.docs)}
                        >
                          <FiFileText className="btn-icon" /> View
                        </button>
                      </td>
                      <td data-label="Status">
                        <select
                          className={
                            doctor.status === "Pending"
                              ? "value-pending"
                              : doctor.status === "Accepted"
                              ? "value-accepted"
                              : "value-rejected"
                          }
                          value={doctor.status}
                          onChange={(e) =>
                            handleUpdateStatus(doctor._id, e.target.value, doctor)
                          }
                        >
                          <option value="Pending">
                            <span className="option-icon"><FiClock /></span> Pending
                          </option>
                          <option value="Accepted">
                            <span className="option-icon"><FiCheckCircle /></span> Accepted
                          </option>
                          <option value="Rejected">
                            <span className="option-icon"><FiXCircle /></span> Rejected
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))
                : <tr>
                    <td colSpan="6" className="no-data">
                      No doctor requests found. New registration requests will appear here.
                    </td>
                  </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Message Modal */}
      {showReturnMessage && selectedDoctor && (
        <div className="return-message-modal-overlay">
          <div className="return-message-modal">
            <div className="return-message-modal-header">
              <h2>Message from Dr. {selectedDoctor.FirstName} {selectedDoctor.LastName}</h2>
              <button className="close-button" onClick={closeReturnMessage}>×</button>
            </div>
            <div className="return-message-modal-body">
              <p className="return-message-label">
                <strong>Re-registration Message:</strong>
              </p>
              <div className="return-message-content">
                {selectedDoctor.returnMessage || "No additional message provided."}
              </div>
              <div className="return-message-info">
                <p>
                  <strong>Registration Type:</strong> {selectedDoctor.startedFresh ? 
                    "Starting fresh (new registration)" : 
                    "Restoring previous data"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedDoctor.email}
                </p>
                <p>
                  <strong>Department:</strong> {selectedDoctor.department}
                </p>
              </div>
            </div>
            <div className="return-message-modal-footer">
              <button 
                className="primary-button"
                onClick={closeReturnMessage}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default DocterRequest
