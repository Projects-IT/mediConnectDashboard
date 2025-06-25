import {configureStore} from '@reduxjs/toolkit'
import adminAuthorslice from './slices/adminSlice'
import  doctorAuthorslice  from './slices/doctorSlice'
export let Store=configureStore(
    {
        reducer:{
            adminAuthorLoginSlice:adminAuthorslice,
            doctorAuthorLoginSlice:doctorAuthorslice
        }
    }
)