import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiLock, FiShield } from 'react-icons/fi';
import './Settings.css';
import { ApiUrlContext } from '../../App';

const Settings = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const apiUrl = useContext(ApiUrlContext);

    const { currentDoctor } = useSelector(state => state.doctorAuthorLoginSlice);

    const password = watch('password');

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        try {
            const id = currentDoctor._id;
            const res = await axios.put(`${apiUrl}/doctor-api/change/${id}`, { password: data.password });

            if (res.data.message === "password changed successfully") {
                toast.success("Password changed successfully!");
                navigate('/dashboard');
            } else {
                setError(res.data.message);
                toast.error(res.data.message);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="settings-page">
            <div className="form-container">
                <div className="form-header">
                    <FiShield className="form-icon" />
                    <h1 className="form-title">Change Password</h1>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleSubmit(onSubmit)} className="settings-form">
                    <div className="form-group">
                        <label htmlFor="password">
                            <FiLock className="input-icon" /> New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter new password"
                            {...register("password", {
                                required: "New password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters"
                                }
                            })}
                        />
                        {errors.password && <p className="error-text">{errors.password.message}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            <FiLock className="input-icon" /> Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            {...register("confirmPassword", {
                                required: "Please confirm your new password",
                                validate: value =>
                                    value === password || "The passwords do not match"
                            })}
                        />
                        {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Settings;
