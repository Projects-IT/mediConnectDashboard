import React from 'react'
import { useNavigate } from 'react-router-dom'
import img from './image.png'

function UserType() {
    let navigate=useNavigate()
    function navDoctor(){
        navigate('/loginDoctor')
    }
    function navAdmin(){
        navigate('/loginAdmin')
    }
  return (
    <div>
        <>
      <section className="container form-component">
        <img src={img} alt="logo" className="logo" style={{height:"5rem"}}/>
        <h1 className="form-title">WELCOME TO MEDICONNECT</h1>
        <button onClick={navDoctor}>Doctor</button>
        <button onClick={navAdmin}>Admin</button>
        
      </section>
    </>
    </div>
  )
}

export default UserType