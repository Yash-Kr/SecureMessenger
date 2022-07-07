import React from 'react'
import { useState, useRef, useEffect } from 'react';
import DialogBox from '../components/DialogBox';
import './message.css'
import Keychoice from '../components/Keychoice';
import DataService from '../fire/FirebaseOperations'
import {arrayUnion, doc , onSnapshot} from "firebase/firestore"
import {database} from '../fire/FirebaseConfig'
import Cryptography from '../crypto/Cryptography'

function Message({closeMessage,friend, uid}) {

    const [open, setOpen] = React.useState(false);

    const [messages, setMessages] = useState([]); //all messages for selected friend

    const [keypair, setKeypair] = useState({public_pem:"null",wrapped_pem:"null"});
   
    
    const messageEndRef = useRef();

    const handleClickOpen = () => {
        setOpen(true);
      };
      
      const handleClose = (key) => {
        setOpen(false);
        decryptMessages(key);
      };

      const inputRef = useRef();

      const getKeys = async () => {
          let data = await DataService.getData("users",uid);
          let fdata = await DataService.getData("users",friend.uid);
          let wrapped_pem = data?._document.data.value.mapValue.fields.privateKey.stringValue;
          let my_public_pem =  data?._document.data.value.mapValue.fields.publicKey.stringValue;
          let public_pem =  fdata?._document.data.value.mapValue.fields.publicKey.stringValue;

          // let wrapped_buff = await Cryptography.pem2ab(wrapped_pem);
          // let public_key = await Cryptography.importRsaKey(public_pem);
          //let private_key = await this.unwrapPrivateKey(wrapped_buff); 
          setKeypair({public_pem,wrapped_pem,my_public_pem})  
      }

      const decryptMessages = async (key) => {
        let success = true;
         let uid = window.localStorage.getItem("uid")
         let wrapped_pem = keypair.wrapped_pem;
         let private_buff = Cryptography.pem2ab(wrapped_pem);
         let unwrapped_key = await Cryptography.unwrapPrivateKey(private_buff,key).catch((error) => success=false);
         if(!success) {
            window.alert("Wrong Password");
            return;
         }
         let all_messages = [];
        
        for(let i=0;i<messages.length;i++)
        {
              let message = messages[i];
              let msg_text = message.sender === uid ? message.my_text : message.text;
              let success = true;
              let plain = await Cryptography.decryptMessage(unwrapped_key, Cryptography.base64ToArrayBuffer(msg_text)).catch((error) =>  success=false);
              console.log(plain)
              if(!success) return;
              plain = await Cryptography.ab2str(plain)
              const text =  plain;
              const my_text = plain;
              const sender = message.sender;
              const time = message.time;
              const obj = {text,sender,time,my_text}
              all_messages.push(obj)
        }
         if(!success) return;
         setMessages(all_messages)
        
      }

      const sendMessage = async () => {
          let message = inputRef.current.value.trim();
          if(!message) return;

          let public_key = await Cryptography.importRsaKey(keypair.public_pem);  //public key of my friend
          let my_public_key = await Cryptography.importRsaKey(keypair.my_public_pem);  //public key of my friend
          let my_cipherText = await Cryptography.encryptMessage(my_public_key,message);
          let cipherText = await Cryptography.encryptMessage(public_key,message);
          let readable = await Cryptography.arrayBufferToBase64(cipherText);
          let my_readable = await Cryptography.arrayBufferToBase64(my_cipherText);
         
          let time = new Date();
          let msg = {
            timestamp: time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
            sender:uid,
            message:readable,
            my_message:my_readable,
          };
        let updateself = await DataService.updateData("users",uid,{
            [friend.uid] : arrayUnion(msg),
        })

        let updatefriend = await DataService.updateData("users",friend.uid,{
          [uid] : arrayUnion(msg)
      })

      inputRef.current.value ="";
      }


      useEffect(() => {
        messageEndRef?.current?.scrollIntoView();
      })

      const getAllMessages = async () => {
        let uid = window.localStorage.getItem("uid");
        let fuid = friend.uid;

        let Doc = doc(database,"users",uid);
        let myfun = onSnapshot(Doc , async (querysnap)=>{
            // console.log(querysnap)
            let data = await querysnap?._document?.data?.value?.mapValue?.fields
            data = data[fuid].arrayValue.values
            if(!data){
              setMessages([])
              return;
            };
            let all_messages = [];
            for(var i=0;i<data.length;i++)
            {    
              const text = await data[i].mapValue?.fields?.message?.stringValue;
              const my_text = await data[i].mapValue?.fields?.my_message?.stringValue;
              const sender = await data[i].mapValue?.fields?.sender?.stringValue;
              const time = await data[i].mapValue?.fields?.timestamp?.stringValue;
              const obj = {text,sender,time,my_text}
              all_messages.push(obj)
            }
           setMessages(all_messages);
           //console.log(all_messages)
        })
   }
 
   //run this whenever user selects a new friend
   useEffect(() => {
       getAllMessages();
       getKeys();
   },[friend])


  return (
    <div id="rcw-conversation-container" className="rcw-conversation-container active" aria-live="polite">
         {open ? <DialogBox open={open} handleClose={handleClose}/> : <></>}
         
                <div className="rcw-header">
                  <div className='row no-gutters'>
                      <div className='col-sm-1'> <div  onClick={closeMessage} style={{display:"inline-block"}} className="iconify-back"><span className="iconify" data-icon="akar-icons:arrow-back-thick-fill"></span></div><img src={`./avatars/avatar${friend.avatar}.png`} alt='contact-img' className='contact-img'></img> </div>
                      <div className='col-sm-9 contact-name'> <span>{friend.name}</span></div>
                      <div className='col-sm-2 decrypt-btn' style={{position:"relative"}}>
                          <button onClick={handleClickOpen}>Decrypt</button>
                      </div>
                  </div>
                </div>

              <div id="messages" className="rcw-messages-container">

                {
                  messages.map((message,index) => {
                        if(message.sender===uid)
                        {
                          return  <div className="rcw-message rcw-message-client" key={index}>
                              <div className="rcw-client">
                              <div className="rcw-message-text"><p>{message.my_text.substring(0,50)}...</p></div>
                              <span className="rcw-timestamp">{message.time}</span>
                              </div>
                           </div>
                        }
                        else{
                           return  <div className="rcw-message " key={index}>
                              <div className="rcw-response">
                                <div className="rcw-message-text">
                                  <p>{message.text.substring(0,50)}...</p>
                                </div>
                                <span className="rcw-timestamp">{message.time}</span>
                              </div>
                          </div>
                        }
                  })
                }

      
                  <div className="loader"><div className="loader-container"><span className="loader-dots"></span><span className="loader-dots"></span><span className="loader-dots"></span></div></div>
              
                 <div ref={messageEndRef}></div>
               </div>

               <div className="rcw-sender">
                    <button className="rcw-picker-btn" type="submit"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMmM1LjUxNCAwIDEwIDQuNDg2IDEwIDEwcy00LjQ4NiAxMC0xMCAxMC0xMC00LjQ4Ni0xMC0xMCA0LjQ4Ni0xMCAxMC0xMHptMC0yYy02LjYyNyAwLTEyIDUuMzczLTEyIDEyczUuMzczIDEyIDEyIDEyIDEyLTUuMzczIDEyLTEyLTUuMzczLTEyLTEyLTEyem01LjUwNyAxMy45NDFjLTEuNTEyIDEuMTk1LTMuMTc0IDEuOTMxLTUuNTA2IDEuOTMxLTIuMzM0IDAtMy45OTYtLjczNi01LjUwOC0xLjkzMWwtLjQ5My40OTNjMS4xMjcgMS43MiAzLjIgMy41NjYgNi4wMDEgMy41NjYgMi44IDAgNC44NzItMS44NDYgNS45OTktMy41NjZsLS40OTMtLjQ5M3ptLTkuMDA3LTUuOTQxYy0uODI4IDAtMS41LjY3MS0xLjUgMS41cy42NzIgMS41IDEuNSAxLjUgMS41LS42NzEgMS41LTEuNS0uNjcyLTEuNS0xLjUtMS41em03IDBjLS44MjggMC0xLjUuNjcxLTEuNSAxLjVzLjY3MiAxLjUgMS41IDEuNSAxLjUtLjY3MSAxLjUtMS41LS42NzItMS41LTEuNS0xLjV6Ii8+PC9zdmc+Cg==" className="rcw-picker-icon" alt="" />
                    </button>
                    <div className="rcw-new-message"><input spellcheck="true" className="rcw-input" role="textbox" contenteditable="true" placeholder="Type a message..." ref={inputRef}></input></div>
                    <button type="submit" className="rcw-send" onClick={() => sendMessage()}>
                      <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSIwIDAgNTM1LjUgNTM1LjUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUzNS41IDUzNS41OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGcgaWQ9InNlbmQiPgoJCTxwb2x5Z29uIHBvaW50cz0iMCw0OTcuMjUgNTM1LjUsMjY3Ljc1IDAsMzguMjUgMCwyMTYuNzUgMzgyLjUsMjY3Ljc1IDAsMzE4Ljc1ICAgIiBmaWxsPSIjY2JjYmNiIi8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" className="rcw-send-icon" alt="Send"/>
                    </button>
                
               </div>

               </div>
  )
}

export default Message