import React from 'react'
import { useDispatch,useSelector } from 'react-redux';

function TimeForm() {
  let {isLoginDoctor,errOccurredDoctor,errMesDoctor,currentDoctor}=useSelector(state=>state.doctorAuthorLoginSlice)
  return (
    <div className="container add-doctor-form">
        {/* <input type="date" defaultValue={} id="" placeholder='Date' style={{width:"20vw"}}/>
        <input type="time"  id="" placeholder='time'style={{width:"20vw"}} /> */}
    </div>
  )
}

export default TimeForm