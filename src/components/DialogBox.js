import React, { useRef } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function DialogBox({open,handleClose}) {

  const keyref = useRef();
  return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Secret Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your key to decrypt the messages
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            type="email"
            fullWidth
            variant="standard"
            inputRef={keyref}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(keyref.current.value.trim())}>Decrypt</Button>
        </DialogActions>
      </Dialog>
  )
}

export default DialogBox