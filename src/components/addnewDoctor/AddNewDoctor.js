import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from 'react-hook-form';
import axios from "axios";
import img from "./image.png";
import { FiUser, FiMail, FiPhone, FiCalendar, FiUsers, FiAlertTriangle } from "react-icons/fi";
import './AddNewDoctor.css';
import { ApiUrlContext } from '../../App';

const AddNewDoctor = () => {
  const { register, handleSubmit, formState: { errors }, setValue, getValues, watch } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docAvatar, setDocAvatar] = useState("");
  const [doc, setDoc] = useState("");
  const [docAvatarPreview, setDocAvatarPreview] = useState("");
  const [err, setErr] = useState('');
  const [avatarError, setAvatarError] = useState("");
  const [docError, setDocError] = useState("");
  const [isDeletedDoctor, setIsDeletedDoctor] = useState(false);
  const [deletedDoctorData, setDeletedDoctorData] = useState(null);
  const [showReturnOptions, setShowReturnOptions] = useState(false);
  const [returnMessage, setReturnMessage] = useState("");
  const [usePreviousData, setUsePreviousData] = useState("false");
  
  const apiUrl = useContext(ApiUrlContext);
  const navigate = useNavigate();

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ];

  const firstName = watch("FirstName");
  const lastName = watch("LastName");
  const email = watch("email");

  // Check if doctor exists in deleted collection when name or email is entered
  useEffect(() => {
    const checkForDeletedDoctor = async () => {
      if ((firstName && lastName) || email) {
        try {
          console.log("Checking for deleted doctor with data:", {
            email: email,
            FirstName: firstName,
            LastName: lastName
          });
          
          const response = await axios.post(`${apiUrl}/doctor-api/check-deleted`, {
            email: email,
            FirstName: firstName,
            LastName: lastName
          });
          
          console.log("Response:", response);
          
          if (response.data.isDeleted) {
            setIsDeletedDoctor(true);
            setDeletedDoctorData(response.data.doctor);
            setShowReturnOptions(true);
            toast.info("This doctor was previously registered but was removed.");
          } else {
            setIsDeletedDoctor(false);
            setDeletedDoctorData(null);
            setShowReturnOptions(false);
          }
        } catch (error) {
          console.error("Error checking for deleted doctor:", error);
          console.log("Response status:", error.response?.status);
          console.log("Response data:", error.response?.data);
        }
      }
    };
    
    // Debounce the check to avoid too many requests
    const timeoutId = setTimeout(() => {
      if ((firstName && lastName) || email) {
        checkForDeletedDoctor();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [firstName, lastName, email, apiUrl]);

  const handleAvatar = (e) => {
    const avthar = e.target.files[0];
    if (!avthar) {
      setAvatarError("Avatar image is required");
      setDocAvatarPreview("");
      setDocAvatar("");
      return;
    }
    setAvatarError("");
    const reader = new FileReader();
    reader.readAsDataURL(avthar);
    reader.onload = () => {
      setDocAvatarPreview(reader.result);
      setDocAvatar(avthar);
    };
  };
 
  const handleDoc = (e) => {
    const Doc = e.target.files[0];
    if (!Doc) {
      setDocError("Doctor's document is required");
      setDoc("");
      return;
    }
    setDocError("");
    const reader = new FileReader();
    reader.readAsDataURL(Doc);
    reader.onload = () => {
      setDoc(Doc);
    };
  };

  async function DocRegister(obj) {
    setErr("");
    let hasError = false;
    if (!docAvatar) {
      setAvatarError("Avatar image is required");
      hasError = true;
    } else {
      setAvatarError("");
    }
    if (!doc) {
      setDocError("Doctor's document is required");
      hasError = true;
    } else {
      setDocError("");
    }
    if (hasError) return;
    setIsSubmitting(true);
    
    // Add fields needed for returning doctors
    if (isDeletedDoctor) {
      obj.isReturning = true;
      obj.usePreviousData = usePreviousData;
      obj.returnMessage = returnMessage;
    }
    
    obj.avthar = docAvatar;
    obj.doctorDoc = doc;
    obj.status = "Pending";
    
    try {
      const res = await axios.post(`${apiUrl}/doctor-api/doctor`, obj, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.message.includes('register successful')) {
        if (isDeletedDoctor) {
          if (usePreviousData === "true") {
            toast.success("Re-registration with previous data successful! Awaiting admin approval.");
          } else {
            toast.success("Re-registration as new doctor successful! Awaiting admin approval.");
          }
        } else {
          toast.success("Registration successful! Awaiting admin approval.");
        }
        navigate('/');
      } else {
        setErr(res.data.message);
      }
    } catch (error) {
      setErr(error.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Auto-fill form with deleted doctor data if restoring previous data
  const autofillDeletedDoctorData = () => {
    if (deletedDoctorData && usePreviousData === "true") {
      setValue("FirstName", deletedDoctorData.FirstName);
      setValue("LastName", deletedDoctorData.LastName);
      setValue("email", deletedDoctorData.email);
      setValue("mobile", deletedDoctorData.mobile);
      setValue("dateOfBirth", deletedDoctorData.dateOfBirth ? deletedDoctorData.dateOfBirth.substring(0, 10) : "");
      setValue("gender", deletedDoctorData.gender);
      setValue("department", deletedDoctorData.department);
      
      // We still need new files for avatar and documents
      toast.info("Please upload new avatar and documents");
    }
  };

  // Call autofill when usePreviousData changes
  useEffect(() => {
    if (usePreviousData === "true") {
      autofillDeletedDoctorData();
    }
  }, [usePreviousData]);

  return (
    <section className="add-new-doctor-section">
      <div className="add-doctor-form">
        {/* Left: Logo and Avatar */}
        <div className="doctor-left">
          <img src={img} alt="logo" className="logo" />
          <div className="avatar-section">
            <img
              src={docAvatarPreview || "https://img.freepik.com/premium-psd/3d-cartoon-doctor-portrait-isolated-transparent-background-png-psd_888962-1567.jpg"}
              alt="Doctor Avatar"
            />
            <input 
              type="file" 
              onChange={handleAvatar}
              accept="image/*"
              className="avatar-input"
            />
            {avatarError && <span className="error-text">{avatarError}</span>}
          </div>
        </div>
        
        {/* Right: Form Fields */}
        <div className="doctor-right">
          <h1 className="form-title">
            {isDeletedDoctor ? "Re-register Doctor" : "Register a New Doctor"}
          </h1>
          {err && <div className="error-message">{err}</div>}
          
          {/* Previously Deleted Doctor Alert */}
          {showReturnOptions && (
            <div className="returning-doctor-alert">
              <h3>Previously Registered Doctor</h3>
              <p>This doctor was previously registered but was removed. All re-registrations require admin approval.</p>
              
              <div className="returning-options">
                <label className={usePreviousData === "true" ? "selected" : ""}>
                  <input
                    type="radio"
                    name="usePreviousData"
                    value="true"
                    checked={usePreviousData === "true"}
                    onChange={() => setUsePreviousData("true")}
                  />
                  Restore previous data
                </label>
                
                <label className={usePreviousData === "false" ? "selected" : ""}>
                  <input
                    type="radio"
                    name="usePreviousData"
                    value="false"
                    checked={usePreviousData === "false"}
                    onChange={() => setUsePreviousData("false")}
                  />
                  Register as new doctor
                </label>
              </div>
              
              <div className="return-message">
                <label htmlFor="returnMessage">Message to Admin (optional):</label>
                <textarea
                  id="returnMessage"
                  value={returnMessage}
                  onChange={(e) => setReturnMessage(e.target.value)}
                  placeholder="Provide any additional information about your return or why you were previously removed..."
                  rows="3"
                ></textarea>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(DocRegister)}>
            <div className="form-fields">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="First Name"
                  {...register("FirstName", { required: "First Name is required" })}
                />
                {errors.FirstName && <span className="error-text">{errors.FirstName.message}</span>}
              </div>
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Last Name"
                  {...register("LastName", { required: "Last Name is required" })}
                />
                {errors.LastName && <span className="error-text">{errors.LastName.message}</span>}
              </div>
              
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
                {errors.email && <span className="error-text">{errors.email.message}</span>}
              </div>
              
              <div className="input-group">
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  {...register("mobile", { 
                    required: "Mobile Number is required",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Mobile number must be 10 digits"
                    }
                  })}
                />
                {errors.mobile && <span className="error-text">{errors.mobile.message}</span>}
              </div>
              
              <div className="input-group">
                <input
                  type="date"
                  {...register("dateOfBirth", { required: "Date of Birth is required" })}
                />
                {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth.message}</span>}
              </div>
              
              <div className="input-group">
                <select {...register("gender", { required: "Gender is required" })}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender.message}</span>}
              </div>
              
              <div className="input-group">
                <select {...register("department", { required: "Department is required" })}>
                  <option value="">Select Department</option>
                  {departmentsArray.map((depart, index) => (
                    <option value={depart} key={index}>{depart}</option>
                  ))}
                </select>
                {errors.department && <span className="error-text">{errors.department.message}</span>}
              </div>
              
              <div className="document-upload">
                <input 
                  type="file" 
                  onChange={handleDoc}
                  accept=".pdf,.doc,.docx"
                />
                <p>Upload Doctor's Documents (PDF, DOC)</p>
                {docError && <span className="error-text">{docError}</span>}
              </div>
              
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : isDeletedDoctor ? 'Re-register Doctor' : 'Register New Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddNewDoctor;

