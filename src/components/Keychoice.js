import React, { useState } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import './keychoice.css'

function Keychoice({open,handleClose}) {

    const [algo, setalgo] = useState(-1)
    
    const handleClick = (index) => {
        setalgo(index)
    }

  return (
    <Dialog open={open} onClose={handleClose}>
    <DialogTitle>Encryption Algorithm</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Choose which encryption algorithm you want to use for this friend
      </DialogContentText>
       <div className={`rsa common ${algo===0 ? 'selected-key' : ''}`}>1.  <span onClick={() => handleClick(0)}>RSA</span></div>
        <div className={`aes common ${algo===1 ? 'selected-key' : ''}`}>2. <span onClick={() => handleClick(1)}>AES</span></div>
    </DialogContent>
    <DialogActions>
      <Button variant='outlined' onClick={() => handleClose(algo)} disabled={algo===-1}>Done</Button>
    </DialogActions>
  </Dialog>
  )
}

export default Keychoice