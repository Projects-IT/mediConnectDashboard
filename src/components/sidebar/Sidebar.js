import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    FiGrid,
    FiUsers,
    FiUserCheck,
    FiSettings,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
    FiMessageSquare,
    FiCalendar,
    FiMenu,
    FiX,
    FiMessageCircle
} from "react-icons/fi";
import { FaUserMd, FaUserShield, FaStethoscope, FaUserPlus, FaCalendarCheck, FaEnvelope, FaChartLine, FaClipboardCheck, FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { resetSateAdmin } from "../../redux/slices/adminSlice";
import { resetSateDoctor } from "../../redux/slices/doctorSlice";
import logo from './image.png';
import './Sidebar.css';

const Sidebar = () => {
    const { isLoginDoctor, currentDoctor } = useSelector(state => state.doctorAuthorLoginSlice);
    const { isLoginAdmin, currentAdmin } = useSelector(state => state.adminAuthorLoginSlice);
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Handle responsive sidebar logic
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsOpen(false);
            } else if (window.innerWidth <= 992) {
                setIsOpen(false);
            } else {
                setIsOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (isMobile) {
            setIsOpen(false);
        }
    }, [location.pathname, isMobile]);

    const handleLogout = () => {
        if (isLoginAdmin) {
            dispatch(resetSateAdmin());
        }
        if (isLoginDoctor) {
            dispatch(resetSateDoctor());
        }
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    const user = isLoginDoctor ? currentDoctor : currentAdmin;
    const userRole = isLoginDoctor ? 'Doctor' : 'Admin';

    const adminLinks = (
        <>
            <NavLink to="/dashboard" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FiGrid />
                <span>Dashboard</span>
            </NavLink>
            <NavLink to="/doctors" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FiUsers />
                <span>Doctors</span>
            </NavLink>
            <NavLink to="/admin/addnewdoctor" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FaUserMd />
                <span>Add Doctor</span>
            </NavLink>
            <NavLink to="/admin/addnew" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FaUserShield />
                <span>Add Admin</span>
            </NavLink>
            <NavLink to="/admin/docterRequest" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FiUserCheck />
                <span>Doctor Requests</span>
            </NavLink>
            <NavLink to="/messages" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FiMessageSquare />
                <span>Messages</span>
            </NavLink>
            <NavLink to="/chats" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FiMessageCircle />
                <span>Chats</span>
            </NavLink>
            <NavLink to="/feedback" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FaStar />
                <span>Feedback</span>
            </NavLink>
        </>
    );

    const doctorLinks = (
        <>
            <NavLink to="/dashboard" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FiGrid />
                <span>Dashboard</span>
            </NavLink>
            <NavLink to="/doctor/appointments" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FiCalendar />
                <span>Appointments</span>
            </NavLink>
            <NavLink to="/chats" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FiMessageCircle />
                <span>Chats</span>
            </NavLink>
            <NavLink to="/feedback" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FaStar />
                <span>Feedback</span>
            </NavLink>
            <NavLink to="/doctor/settings" className={({ isActive }) => 
                `sidebar-link-redesigned ${isActive ? 'active' : ''}`} onClick={isMobile ? closeSidebar : null}>
                <FiSettings />
                <span>Settings</span>
            </NavLink>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                    className={`mobile-toggle ${isOpen ? 'active' : ''}`}
                    onClick={toggleSidebar}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                    {isOpen ? <FiX /> : <FiMenu />}
                </button>
            )}

            {/* Hover area to peek sidebar on mobile */}
            {isMobile && !isOpen && <div className="sidebar-peek"></div>}

            {/* Sidebar */}
            <aside className={`sidebar-redesigned ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header-redesigned">
                    <div className="sidebar-header-left">
                        <div className="logo-redesigned">
                            <img src={logo} alt="MediConnect Logo" />
                        </div>
                        <span className="logo-text-redesigned">MediConnect</span>
                    </div>
                    
                    {!isMobile ? (
                        <button 
                            className="toggle-btn-redesigned" 
                            onClick={toggleSidebar}
                            aria-label={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                        >
                            {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
                        </button>
                    ) : null}
                </div>

                <div className="sidebar-nav-redesigned">
                    {isLoginAdmin && adminLinks}
                    {isLoginDoctor && doctorLinks}
                </div>

                <div className="sidebar-footer-redesigned">
                    <div className="user-profile-redesigned">
                        <div className="user-avatar-redesigned">
                            <img 
                                src={user?.avthar || 'https://t4.ftcdn.net/jpg/02/27/45/09/360_F_227450952_KQCMShHPOPebUXklULsKsROk5AvN6H1H.jpg'} 
                                alt="User Avatar"
                                onError={(e) => { e.target.src = 'https://t4.ftcdn.net/jpg/02/27/45/09/360_F_227450952_KQCMShHPOPebUXklULsKsROk5AvN6H1H.jpg' }} 
                            />
                        </div>
                        <div className="user-info-redesigned">
                            <p className="user-name-redesigned">{`${user?.FirstName || 'User'} ${user?.LastName || ''}`}</p>
                            <p className="user-role-redesigned">{userRole}</p>
                        </div>
                    </div>
                    <button className="logout-btn-redesigned" onClick={handleLogout}>
                        <FiLogOut />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            
            {/* Overlay for mobile */}
            {isMobile && isOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar}></div>
            )}
        </>
    );
};

export default Sidebar;
