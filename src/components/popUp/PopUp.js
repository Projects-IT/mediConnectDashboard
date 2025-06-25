import React from 'react'
import {Dialog,DialogTitle,DialogContent, DialogContentText} from '@mui/material'
function PopUp(props) {
    const{title,children,openPopUp,setPopUp}=props
  return (
    <div>
        <Dialog open={openPopUp} maxWidth="sm" >
            <DialogTitle>
                <div>
                    Pop
                    </div>
            </DialogTitle>
            <DialogContent>
                    {children}
            </DialogContent>
            

        </Dialog>
    </div>
  )
}

export default PopUp