import React, { useRef, useState } from 'react'
import './keyconfig.css'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Cryptography from '../crypto/Cryptography'
import DataService from '../fire/FirebaseOperations'

function KeyConfig() {

    let navigate = useNavigate();
    const [keydone, setkeyDone] = useState(false);

    const inputRef = useRef();
    const handleSuccess = () => {
        navigate('/')
    }

    const generateKey = async () => {
      if(!inputRef.current.value) return;
      let keyPair = await Cryptography.generateCryptoKeyPair();
      let public_pem = await Cryptography.exportCryptoKey(keyPair.publicKey)
      let wrapped_key_buffer = await Cryptography.wrapCryptoKey(keyPair.privateKey, inputRef.current.value);   // Step 04 : private key wrapped to an array buffer
      let wrapped_pem = await Cryptography.WrappedKeyToPemString(wrapped_key_buffer) // Step 05 : that array buffer ka string version  ( push to firebase )
      console.log(public_pem)
      console.log(wrapped_pem)
      let uid = window.localStorage.getItem('uid')
      DataService.updateData('users',uid,{ publicKey : public_pem, privateKey :  wrapped_pem, keyGenerated:true})
      setkeyDone(true)
    }

  if(!window.localStorage.getItem('uid')) navigate('/auth')
  return (
    <div className='container key-config'>
        <div className='box'>
            <h1> <img src="./img/key.png"></img> Key Configuration</h1>
            <h5>Generate your public and private keys here !</h5>
            <input type={'text'} placeholder="Choose your password" ref={inputRef}></input>
            <Button variant="contained" size='small' className='generate' onClick={() => generateKey()}>Generate</Button>
            <div className='continue'><Button variant="outlined" size='small' disabled={!keydone} onClick={handleSuccess}>continue</Button></div>
           
            <ul>
                <h6>Key Points to Remember :</h6>
                <li>Your private and pubic keys are required before you start using the app. For those who dont know, Public keys identifies you globally while the Private keys are highly confidential.</li>
                <li>Password that you will enter here will be used to encrypt your private key (using AES) before saving to our database.</li>
                <li><strong>This password will be required every time you want to decrypt the messages</strong> , so choose wisely and remember it all the time as you wont be able to change it later.</li>
                <li>Messages are completely End-to-End encrypted i.e. No one can decrypt your messages expect You, as you will be the only person who knows the right password.</li>
            </ul>
        </div>
    </div>

  )
}

export default KeyConfig