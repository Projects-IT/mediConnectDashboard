import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { toast } from 'react-toastify';
import './Appointments.css';
import { ApiUrlContext } from '../../App';

function Appointments() {
  const { currentDoctor } = useSelector(state => state.doctorAuthorLoginSlice);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = useContext(ApiUrlContext);

  async function getAppointments() {
    try {
      if (currentDoctor && currentDoctor._id) {
        setLoading(true);
        console.log("Fetching appointments for doctor ID:", currentDoctor._id);
        
        // Use doctor ID instead of name for more reliable fetching
        let res = await axios.get(`${apiUrl}/patient-api/Appointments/${currentDoctor._id}`);
        console.log("API response:", res.data);
        
        if (res.data.message === "Current Doctor appointments") {
          setAppointments(res.data.CurrentDoctorAppointments || []);
        } else {
          console.log("Unexpected response message:", res.data.message);
          setAppointments([]);
        }
      } else {
        console.error("Doctor data is incomplete:", currentDoctor);
        setError("Doctor information is incomplete. Please try logging in again.");
      }
    } catch (err) {
      setError("Failed to fetch appointments. Please try again.");
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentDoctor && currentDoctor._id) {
      getAppointments();
    }
  }, [currentDoctor]);

  async function handleUpdateStatus(id, status) {
    try {
      // If status is Completed, also update hasVisited to true
      const updateData = status === "Completed" 
        ? { status, hasVisited: true } 
        : { status };
      
      let res = await axios.put(`${apiUrl}/patient-api/update/${id}`, updateData);
      
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === id
            ? { 
                ...appointment, 
                status, 
                hasVisited: status === "Completed" ? true : appointment.hasVisited 
              }
            : appointment
        )
      );
      
      const statusMessages = {
        "Accepted": "Appointment has been accepted",
        "Rejected": "Appointment has been rejected",
        "Pending": "Appointment has been set to pending",
        "Completed": "Appointment has been marked as completed"
      };
      
      toast.success(statusMessages[status] || "Status updated successfully");
    } catch (err) {
      toast.error("Failed to update appointment status");
      console.error("Error updating status:", err);
    }
  }

  if (loading) {
    return (
      <div className="appointments-page">
        <div className="appointments-header">
          <h1>Manage Appointments</h1>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-page">
        <div className="appointments-header">
          <h1>Manage Appointments</h1>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <h1>Manage Appointments</h1>
        <p>View and manage all your patient appointments</p>
      </div>

      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Department</th>
              <th>Status</th>
              <th>Visited</th>
            </tr>
          </thead>
          <tbody>
            {appointments && appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td data-label="Patient">{`${appointment.FirstName} ${appointment.LastName}`}</td>
                  <td data-label="Date">{new Date(appointment.dateOfAppointment).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                  <td data-label="Department">{appointment.department}</td>
                  <td data-label="Status">
                    <select
                      className={
                        appointment.status === "Pending"
                          ? "value-pending"
                          : appointment.status === "Accepted"
                          ? "value-accepted"
                          : appointment.status === "Completed"
                          ? "value-completed"
                          : "value-rejected"
                      }
                      value={appointment.status}
                      onChange={(e) =>
                        handleUpdateStatus(appointment._id, e.target.value)
                      }
                      aria-label="Change appointment status"
                    >
                      <option value="Pending" className="value-pending-option">Pending</option>
                      <option value="Accepted" className="value-accepted-option">Accepted</option>
                      <option value="Completed" className="value-completed-option">Completed</option>
                      <option value="Rejected" className="value-rejected-option">Rejected</option>
                    </select>
                  </td>
                  <td data-label="Visited">
                    {appointment.hasVisited === true ? (
                      <GoCheckCircleFill className="green" />
                    ) : (
                      <AiFillCloseCircle className="red" />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-appointments">
                  No appointments found. New appointments will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Appointments; 

