import { FiUsers, FiCalendar, FiCheckSquare } from "react-icons/fi";
import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios';
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { useDispatch, useSelector } from 'react-redux';
import PopUp from '../popUp/PopUp';
import TimeForm from '../timeForm/TimeForm';
import './Dashboard.css';
import { ApiUrlContext } from '../../App';

function Dashboard() {
  const { isLoginDoctor, currentDoctor } = useSelector(state => state.doctorAuthorLoginSlice);
  const { isLoginAdmin, currentAdmin } = useSelector(state => state.adminAuthorLoginSlice);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [openPopUp, setPopUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const apiUrl = useContext(ApiUrlContext);

  const defaultAvatar = 'https://t4.ftcdn.net/jpg/02/27/45/09/360_F_227450952_KQCMShHPOPebUXklULsKsROk5AvN6H1H.jpg';

  const handleAvatarError = (e) => {
    e.target.src = defaultAvatar;
  };

  async function get() {
    try {
      setLoading(true);
      
      // Fetch doctors list (for admin)
      const { data } = await axios.get(`${apiUrl}/doctor-api/doctors`);
      setDoctors(data.doctors || []);

      // Fetch appointments based on user role
      if (isLoginAdmin) {
        console.log("Fetching appointments for admin");
        let res = await axios.get(`${apiUrl}/patient-api/Appointment`);
        if (res.data.message === "Previous appointments") {
          console.log("Admin appointments:", res.data.Appointments);
          setAppointments(res.data.Appointments || []);
        }
      }
      
      if (isLoginDoctor && currentDoctor && currentDoctor._id) {
        console.log("Fetching appointments for doctor with ID:", currentDoctor._id);
        // Use doctor ID instead of name for more reliable fetching
        let res = await axios.get(`${apiUrl}/patient-api/Appointments/${currentDoctor._id}`);
        console.log("Doctor appointments response:", res.data);
        if (res.data.message === "Current Doctor appointments") {
          console.log("Doctor appointments:", res.data.CurrentDoctorAppointments);
          setAppointments(res.data.CurrentDoctorAppointments || []);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if ((isLoginDoctor && currentDoctor) || (isLoginAdmin && currentAdmin)) {
      get();
    }
  }, [isLoginDoctor, isLoginAdmin, currentDoctor, currentAdmin]);

  async function handleUpdateStatus(id, status) {
    try {
      let res = await axios.put(`${apiUrl}/patient-api/update/${id}`, { status });
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === id
            ? { ...appointment, status }
            : appointment
        )
      );
      if (status === "Accepted") {
        setPopUp(true);
      }
    } catch (err) {
      console.error("Error updating appointment status:", err);
    }
  }

  const user = isLoginDoctor ? currentDoctor : currentAdmin;
  const recentAppointments = appointments.slice(0, 5);

  const stats = isLoginAdmin ? [
    { icon: <FiUsers />, value: doctors.length, label: 'Total Doctors', color: 'blue' },
    { icon: <FiCalendar />, value: appointments.length, label: 'Total Appointments', color: 'green' },
    { icon: <FiCheckSquare />, value: appointments.filter(a => a.status === 'Pending').length, label: 'Pending Requests', color: 'orange' },
  ] : [
    { icon: <FiCalendar />, value: appointments.length, label: 'Total Appointments', color: 'green' },
    { icon: <FiCheckSquare />, value: appointments.filter(a => a.status === 'Pending').length, label: 'Pending Appointments', color: 'orange' },
  ];

  if (loading) {
    return (
      <div className="dashboard-redesigned">
        <div className="dashboard-header-redesigned">
          <div>
            <h1>Loading dashboard...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-redesigned">
      <div className="dashboard-header-redesigned">
        <div>
          <h1>Welcome, {user?.FirstName || 'User'}!</h1>
          <p>Here's a summary of your dashboard.</p>
        </div>
        <div className="user-welcome-avatar">
          <img 
            src={user?.avthar || defaultAvatar}
            alt="User Avatar"
            onError={handleAvatarError}
          />
        </div>
      </div>

      <div className="stats-grid-redesigned">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card-redesigned ${stat.color}`}>
            <div className="stat-icon-redesigned">{stat.icon}</div>
            <div className="stat-info-redesigned">
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-activity-redesigned">
        <h2>Recent Appointments</h2>
        {recentAppointments.length > 0 ? (
          <ul>
            {recentAppointments.map((appointment) => (
              <li key={appointment._id}>
                <div className="activity-user">{`${appointment.FirstName} ${appointment.LastName}`}</div>
                <div className="activity-action">
                  {`Appointment with Dr. ${appointment.doctor} - ${appointment.department}`}
                </div>
                <div className="activity-time">
                  {new Date(appointment.dateOfAppointment).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-data-message">No recent appointments found.</p>
        )}
      </div>

      {openPopUp && <PopUp />}
    </div>
  );
}

export default Dashboard;