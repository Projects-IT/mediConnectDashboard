import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form"
import { Link } from 'react-router-dom';
import { useDispatch,useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminAuthorThunk } from "../../redux/slices/adminSlice";
import axios from "axios";
import img from './image.png'
function LoginAdmin(){
  let {register,handleSubmit,formState:{errors}}=useForm()
  let {isLoginAdmin,errOccurredAdmin,errMesAdmin,currentAdmin}=useSelector(state=>state.adminAuthorLoginSlice)
  let navigate=useNavigate();
  let dispatch=useDispatch()
  function setAut(credObj){
    dispatch(adminAuthorThunk(credObj))
    console.log(credObj);
    
  }
  useEffect(()=>{
    if(isLoginAdmin==true){
      
        navigate('/dashboard')
      
    }
    
  },[isLoginAdmin])
  
  return (
    <>
      <section className="container form-component">
        <img src={img} alt="logo" className="logo" style={{height:"5rem"}} />
        <h1 className="form-title">WELCOME TO MEDICONNECT</h1>
        <p>Only Admins Are Allowed To Access These Resources!</p>
        <p>{errOccurredAdmin === true && (
                <div className="text-center text-danger">
                  <h6>{errMesAdmin}</h6>
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
          </div>
          <div style={{ justifyContent: "center", alignItems: "center" }}>
            <button type="submit">Login</button>
          </div>
        </form>
      </section>
    </>
  );
};

export default LoginAdmin;
