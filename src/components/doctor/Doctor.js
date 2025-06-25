import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { FaFilePdf, FaSearch, FaUserMd, FaEnvelope, FaPhone, FaTrash, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import './Doctor.css';
import { ApiUrlContext } from '../../App';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [removalReason, setRemovalReason] = useState("");
  const defaultAvatarUrl = 'https://i.ibb.co/6JMzQrk/default-avatar.png';
  const navigate = useNavigate();
  const apiUrl = useContext(ApiUrlContext);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${apiUrl}/doctor-api/doctors`
      );
      setDoctors(data.doctors || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch doctors. Please try again later.");
      toast.error("Failed to fetch doctors. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const showPdf = (pdf) => {
    window.open(`${apiUrl}/uploads/${pdf}`, "_blank", "noreferrer");
  };

  const handleAvatarError = (e) => {
    e.target.src = defaultAvatarUrl;
  };

  const openRemoveModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowRemoveModal(true);
  };

  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    setSelectedDoctor(null);
    setRemovalReason("");
  };

  const handleRemoveDoctor = async () => {
    if (!selectedDoctor) return;
    
    try {
      const response = await axios.post(
        `${apiUrl}/doctor-api/remove/${selectedDoctor._id}`,
        { reason: removalReason }
      );
      
      if (response.data.message) {
        toast.success("Doctor removed successfully");
        fetchDoctors(); // Refresh the list
        closeRemoveModal();
      }
    } catch (err) {
      console.error("Error removing doctor:", err);
      toast.error("Failed to remove doctor. Please try again.");
    }
  };
  
  const viewDoctorDetails = (doctorId) => {
    navigate(`/doctor-details/${doctorId}`);
  };

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.FirstName} ${doctor.LastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    doctor.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="doctors-page-redesigned">
      <div className="page-header-redesigned">
        <h1 className="page-title-redesigned">Manage Doctors</h1>
        <p className="page-subtitle-redesigned">View, search, and manage doctor profiles.</p>
      </div>

      <div className="controls-container-redesigned">
        <div className="search-bar-redesigned">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading doctors...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="doctors-grid-redesigned">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div key={doctor._id} className="doctor-card-redesigned">
                <img
                  src={doctor.avthar || defaultAvatarUrl}
                  alt={`${doctor.FirstName} ${doctor.LastName}`}
                  className="doctor-avatar-redesigned"
                  onError={handleAvatarError}
                />
                <div className="doctor-info-redesigned">
                  <h4 className="doctor-name-redesigned">{`Dr. ${doctor.FirstName} ${doctor.LastName}`}</h4>
                  <p className="doctor-department-redesigned">{doctor.department}</p>
                  <div className="doctor-contact-redesigned">
                    <p><FaEnvelope /> {doctor.email}</p>
                    <p><FaPhone /> {doctor.mobile}</p>
                  </div>
                </div>
                <div className="doctor-actions-redesigned">
                  <button
                    className="btn-primary view-details-btn"
                    onClick={() => viewDoctorDetails(doctor._id)}
                  >
                    <FaInfoCircle /> View Details
                  </button>
                  
                  {doctor.docs ? (
                    <button
                      className="btn-primary"
                      onClick={() => showPdf(doctor.docs)}
                      title="View Document"
                    >
                      <FaFilePdf /> View Document
                    </button>
                  ) : (
                    <p className="no-document">No document</p>
                  )}
                  
                  <button
                    className="btn-danger"
                    onClick={() => openRemoveModal(doctor)}
                    title="Remove Doctor"
                  >
                    <FaTrash /> Remove Doctor
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No doctors found matching your criteria.</div>
          )}
        </div>
      )}

      {/* Remove Doctor Modal */}
      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Remove Doctor</h2>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to remove Dr. {selectedDoctor?.FirstName}{" "}
                {selectedDoctor?.LastName}?
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
    </section>
  );
};

export default Doctors;



