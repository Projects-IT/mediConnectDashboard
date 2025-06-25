import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form"
import { Link } from 'react-router-dom';
import { useDispatch,useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { doctorAuthorThunk } from "../../redux/slices/doctorSlice";
import axios from "axios";
import img from './image.png'
function LoginDoctor(){
  let {register,handleSubmit,formState:{errors}}=useForm()
  let {isLoginDoctor,errOccurredDoctor,errMesDoctor,currentDoctor}=useSelector(state=>state.doctorAuthorLoginSlice)
  let navigate=useNavigate();
  let dispatch=useDispatch()
  function setAut(credObj){
    dispatch(doctorAuthorThunk(credObj))
    console.log(credObj);
    
  }
  useEffect(()=>{
    if(isLoginDoctor==true){
      
        navigate('/dashboard')
      
    }
    
  },[isLoginDoctor])
  
  return (
    <>
      <section className="container form-component">
        <img src={img} alt="logo" className="logo" style={{height:"5rem"}} />
        <h1 className="form-title">WELCOME TO MEDICONNECT</h1>
        <p>Only Doctors Are Allowed To Access These Resources!</p>
        <p>{errOccurredDoctor === true && (
                <div className="text-center text-danger">
                  <h6>{errMesDoctor}</h6>
                </div>
              )}
        </p>
        <form onSubmit={handleSubmit(setAut)}>
          <input
            type="email"
            placeholder="Email"
            // value={email}
            {...register("email")}
          />
          <input
            type="password"
            placeholder="Password"
            // value={password}
            {...register("password")}
          />
          <div
            style={{
              gap: "10px",
              justifyContent: "flex-end",
              flexDirection: "row",
            }}
          >
            <h3 style={{ marginBottom: 0 }}>Not Registered?</h3>
            <Link
              to={"/doctor/addnew"}
              style={{ textDecoration: "none", color: "#271776ca" }}
            >
              Register Now
            </Link>
          </div>
          <div style={{ justifyContent: "center", alignItems: "center" }}>
            <button type="submit">Login</button>
          </div>
        </form>
      </section>
    </>
  );
};

export default LoginDoctor;
