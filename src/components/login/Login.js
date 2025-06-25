import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { adminAuthorThunk } from '../../redux/slices/adminSlice';
import { doctorAuthorThunk } from '../../redux/slices/doctorSlice';
import { FaUserShield, FaUserMd } from 'react-icons/fa';
import logo from './image.png';
import './Login.css';
import { ApiUrlContext } from '../../App';

const Login = () => {
    const [loginType, setLoginType] = useState('admin');
    const { register, handleSubmit, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const apiUrl = useContext(ApiUrlContext);

    const { isLoginAdmin, errMesAdmin } = useSelector(state => state.adminAuthorLoginSlice);
    const { isLoginDoctor, errMesDoctor } = useSelector(state => state.doctorAuthorLoginSlice);

    const onSubmit = (credentials) => {
        if (loginType === 'admin') {
            dispatch(adminAuthorThunk({adminCredObj: credentials, apiUrl}));
        } else {
            dispatch(doctorAuthorThunk({doctorCredObj: credentials, apiUrl}));
        }
    };

    useEffect(() => {
        if (isLoginAdmin || isLoginDoctor) {
            navigate('/dashboard');
        }
    }, [isLoginAdmin, isLoginDoctor, navigate]);

    const errorMessage = loginType === 'admin' ? errMesAdmin : errMesDoctor;

    return (
        <div className="login-page-redesigned">
            <div className="login-container-redesigned">
                <div className="login-branding-redesigned">
                    <div className="logo-redesigned">
                        <img src={logo} alt="MediConnect Logo" />
                    </div>
                    <h1>MediConnect</h1>
                    <p>Your Health, Our Priority.</p>
                </div>
                <div className="login-form-container-redesigned">
                    <h2>Welcome Back!</h2>
                    <div className="login-toggle-redesigned">
                        <button
                            className={`toggle-btn ${loginType === 'admin' ? 'active' : ''}`}
                            onClick={() => setLoginType('admin')}
                        >
                            <FaUserShield /> Admin
                        </button>
                        <button
                            className={`toggle-btn ${loginType === 'doctor' ? 'active' : ''}`}
                            onClick={() => setLoginType('doctor')}
                        >
                            <FaUserMd /> Doctor
                        </button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="login-form-redesigned">
                        {errorMessage && <p className="error-message-redesigned">{errorMessage}</p>}
                        <div className="input-group-redesigned">
                            <input
                                type="email"
                                placeholder="Email Address"
                                {...register('email', { required: 'Email is required' })}
                            />
                            {errors.email && <p className="error-text-redesigned">{errors.email.message}</p>}
                        </div>
                        <div className="input-group-redesigned">
                            <input
                                type="password"
                                placeholder="Password"
                                {...register('password', { required: 'Password is required' })}
                            />
                            {errors.password && <p className="error-text-redesigned">{errors.password.message}</p>}
                        </div>
                        <button type="submit" className="btn-submit-redesigned">Login</button>
                        {loginType === 'doctor' && (
                            <p className="register-link-redesigned">
                                Not a member? <Link to="/doctor/addnew">Register Now</Link>
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
