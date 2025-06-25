import { createSlice,createAsyncThunk, isPending } from "@reduxjs/toolkit";
import axios from "axios";
export let doctorAuthorThunk=createAsyncThunk('doctorAuth',async({doctorCredObj, apiUrl},thunkApi)=>{
    try {

       let res= await axios.post(`${apiUrl}/doctor-api/login`,doctorCredObj)
       if(res.data.message==="Login success"){
            // localStorage.setItem("token",res.data.token)
            console.log("login success");
       }else{
        return thunkApi.rejectWithValue(res.data.message)
       }
       console.log(res.data);
       return res.data
    } catch (error) {
            return thunkApi.rejectWithValue(error)
    }

})

export let doctorAuthorslice=createSlice(
    {
        name:'doctor_Auth',
        initialState:{
            isPendingDoctor:false,
            isLoginDoctor:false,
            currentDoctor:{},
            errOccurredDoctor:false,
            errMesDoctor:''

        },
        reducers:{
            resetSateDoctor:(state,action)=>{
            state.isPendingDoctor=false
            state.isLoginDoctor=false
            state.currentDoctor={}
            state.errOccurredDoctor=false
            state.errMesDoctor=''
        }
    },
        extraReducers:builder=>{
            builder
            .addCase(doctorAuthorThunk.pending,(state,action)=>{
                state.isPendingDoctor=true;
            })
            .addCase(doctorAuthorThunk.fulfilled,(state,action)=>{
                state.isPendingDoctor=false
                state.isLoginDoctor=true
                state.currentDoctor=action.payload.doctor
                state.errOccurredDoctor=false
                state.errMesDoctor=''
            })
            .addCase(doctorAuthorThunk.rejected,(state,action)=>{
                state.isPendingDoctor=false
                state.isLoginDoctor=false
                state.currentDoctor={}
                state.errOccurredDoctor=true
                state.errMesDoctor=action.payload
            })
        }
    }
)
export default doctorAuthorslice.reducer
export let {resetSateDoctor} =doctorAuthorslice.actions