import React, { useState } from 'react'
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import { Button } from '@mui/material';
import IconButton from "@material-ui/core/IconButton";
import Search from "@material-ui/icons/Search";
import Add from "@material-ui/icons/Add";
import './searchfriend.css'
import Keychoice from './Keychoice';
import DataService from '../fire/FirebaseOperations'
import {useRef} from 'react'
import { arrayUnion } from 'firebase/firestore';
import { FormatAlignCenterOutlined } from '@material-ui/icons';
import { map } from '@firebase/util';

function SearchFriend({hideSearchFriend}) {

    const [open, setOpen] = React.useState(false);
    const [show, setShow] = useState(false)
    const [friend, setFriend] = useState({name:"",uid:"",avatar:"",algo:0})

    const inputRef  = useRef();


    //algo == 0 for RSA and 1 for AES
    const handleClose = async (algo) => {
      if(algo!==0 && algo!==1){
        setOpen(false);
        window.alert("Cannot add friend as no encryption algo is selected.")
        return;
      }
    
    
      let frand = friend; 
      frand["algo"] = 0;  
      let uid = window.localStorage.getItem('uid');
      let uname = window.localStorage.getItem('uname');
      let uavatar = window.localStorage.getItem('uavatar');
      let me = {
        name : uname,
        uid : uid,
        avatar : uavatar,
        algo : 0
      }

      let fuid = friend.uid;

      let updateself = await DataService.updateData("users",uid,{
        friends : arrayUnion(frand),
        [fuid] : [],
      });

      let updatefriend = await DataService.updateData("users",fuid,{
        friends : arrayUnion(me),
        [uid] : [],
      });


      setOpen(false);   
      setShow(false);
    };

    const searchFriend = async () => {
          setShow(false)
          if(!inputRef.current.value) return;
          let uid = (""+inputRef.current.value).trim();
          let user = await DataService.getData("users",uid);
          if(!user?._document) return;   // Add UI for Friend Not found
          let name = user?._document?.data?.value?.mapValue?.fields?.name?.stringValue
          let avatar = user?._document?.data?.value?.mapValue?.fields?.avatar?.integerValue
          setFriend({
            uid,name,avatar
          })
          setShow(true); 
    }

  return (
    <div className='search-friend-section col-right'>
      {open ? <Keychoice open={open} handleClose={handleClose}/> : <></>}
       <div className='back-btn'><button onClick={hideSearchFriend}> -- Back</button></div>
        <div className='search-bar'> <input type="text"  placeholder='Search friends by user id' ref={inputRef}></input> <IconButton color="primary" className='button' onClick={() => searchFriend()}>
                      <Search />
                     </IconButton>
         </div>
         { show ? 
         <div className='friend-found'>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={`./avatars/avatar${friend?.avatar}.png`}>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={friend?.uid}
                      secondary={friend?.name}
                      style={{whiteSpace:"nowrap", overflow:"hidden", textOverflow:"...", paddingRight:"10px", marginRight:"10px"}}
                    />
                    <IconButton color="primary" className='button' onClick={() => setOpen(true)}>
                      <Add />
                     </IconButton>
                  </ListItem>
      </div> : <></> }
    </div>
    
  )
}

export default SearchFriend