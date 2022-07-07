import React from 'react'
import './default.css'

function Default() {
  return (
    <div className='default-container'>
       <div> <img src='./img/secure.png'></img> </div>
       <h2>Secure Messenger</h2>
       <h5>Now send and receive your messages in encrypted format. Decide yourself which encryption algorithm you want to use.</h5>
       <h6> <span className="iconify" data-icon="ant-design:lock-filled"></span> All your chats are End-to-End Encryped</h6>
    </div>
  )
}

export default Default