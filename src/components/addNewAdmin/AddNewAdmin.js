import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ApiUrlContext } from '../../App';

const AddNewAdmin = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const apiUrl = useContext(ApiUrlContext);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await axios.post(`${apiUrl}/admin-api/admin`, data);
            if (res.data.message === 'new admin register') {
                toast.success('New admin registered successfully!');
                navigate('/dashboard');
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="dashboard-page add-new-admin-page">
            <div className="page-header">
                <h1 className="page-title">Add New Admin</h1>
            </div>
            <div className="form-container-redesigned">
                <form onSubmit={handleSubmit(onSubmit)} className="add-admin-form grid-col-2">
                    <div className="form-group">
                        <label htmlFor="FirstName">First Name</label>
                        <input
                            id="FirstName"
                            type="text"
                            placeholder="John"
                            {...register('FirstName', { required: 'First Name is required' })}
                        />
                        {errors.FirstName && <p className="error-text">{errors.FirstName.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="LastName">Last Name</label>
                        <input
                            id="LastName"
                            type="text"
                            placeholder="Doe"
                            {...register('LastName', { required: 'Last Name is required' })}
                        />
                        {errors.LastName && <p className="error-text">{errors.LastName.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                            })}
                        />
                        {errors.email && <p className="error-text">{errors.email.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="mobile">Mobile Number</label>
                        <input
                            id="mobile"
                            type="tel"
                            placeholder="1234567890"
                            {...register('mobile', {
                                required: 'Mobile Number is required',
                                pattern: { value: /^\d{10}$/, message: 'Mobile number must be 10 digits' },
                            })}
                        />
                        {errors.mobile && <p className="error-text">{errors.mobile.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="dateOfBirth">Date of Birth</label>
                        <input
                            id="dateOfBirth"
                            type="date"
                            {...register('dateOfBirth', { required: 'Date of Birth is required' })}
                        />
                        {errors.dateOfBirth && <p className="error-text">{errors.dateOfBirth.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select id="gender" {...register('gender', { required: 'Gender is required' })}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        {errors.gender && <p className="error-text">{errors.gender.message}</p>}
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="********"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Password must be at least 6 characters' },
                            })}
                        />
                        {errors.password && <p className="error-text">{errors.password.message}</p>}
                    </div>
                    <div className="form-actions full-width">
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default AddNewAdmin;
