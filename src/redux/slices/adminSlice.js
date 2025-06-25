import { createSlice,createAsyncThunk, isPending } from "@reduxjs/toolkit";
import axios from "axios";
export let adminAuthorThunk=createAsyncThunk('adminAuth',async({adminCredObj, apiUrl},thunkApi)=>{
    try {

       let res= await axios.post(`${apiUrl}/admin-api/login`,adminCredObj)
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

export let adminAuthorslice=createSlice(
    {
        name:'admin_Auth',
        initialState:{
            isPendingAdmin:false,
            isLoginAdmin:false,
            currentAdmin:{},
            errOccurredAdmin:false,
            errMesAdmin:''

        },
        reducers:{
            resetSateAdmin:(state,action)=>{
            state.isPendingAdmin=false
            state.isLoginAdmin=false
            state.currentAdmin={}
            state.errOccurredAdmin=false
            state.errMesAdmin=''
        }
    },
        extraReducers:builder=>{
            builder
            .addCase(adminAuthorThunk.pending,(state,action)=>{
                state.isPendingAdmin=true;
            })
            .addCase(adminAuthorThunk.fulfilled,(state,action)=>{
                state.isPendingAdmin=false
                state.isLoginAdmin=true
                state.currentAdmin=action.payload.admin
                state.errOccurredAdmin=false
                state.errMesAdmin=''
            })
            .addCase(adminAuthorThunk.rejected,(state,action)=>{
                state.isPendingAdmin=false
                state.isLoginAdmin=false
                state.currentAdmin={}
                state.errOccurredAdmin=true
                state.errMesAdmin=action.payload
            })
        }
    }
)
export default adminAuthorslice.reducer
export let {resetSateAdmin} =adminAuthorslice.actions