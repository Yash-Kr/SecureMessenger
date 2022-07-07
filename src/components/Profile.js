import React, { useEffect, useState } from 'react'
import { useId } from 'react';
import './profile.css'

function Profile() {

   const [name, setName] = useState("")
   const [avatar, setAvatar] = useState(-1);
   const [email, setEmail] = useState("");
   const [uid, setUid] = useState("");
   useEffect(() => {
        setName(window.localStorage.getItem("uname"));
        setAvatar(window.localStorage.getItem("uavatar"));
        setEmail(window.localStorage.getItem("uemail"))
        setUid(window.localStorage.getItem("uid"))
   },[])
  return (
    <div className='profile-container'>
         <div className="card-container">
            <img className="round" src={`./avatars/avatar${avatar}.png`} alt="user" />
            <h3>{name}</h3>
            <h6>{email}</h6>
            <p>User Id : </p>
            <h5>{uid}</h5>
        </div>
    </div>
  )
}

export default Profile