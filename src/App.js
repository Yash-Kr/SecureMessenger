import React, { useEffect, useRef, useState } from 'react';
import './App.css'
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import ContactList from './contacts/ContactList';
import Typography from '@mui/material/Typography';
import IconButton from "@material-ui/core/IconButton";
import Search from "@material-ui/icons/Search";
import Add from "@material-ui/icons/Add";
import SearchFriend from './components/SearchFriend';
import Message from './message/Message';
import Default from './components/Default';
import { useNavigate } from 'react-router-dom';
import DataService from './fire/FirebaseOperations'
import Profile from './components/Profile';

function App() {

  const [search, searchFriend] = useState(false)
  const [profile, setProfile] = useState(false)
  const navigate = useNavigate();
  const [uid, setUid] = useState();

  const [message, showMessage] = useState(false)  //should message window shoud show or not
  const [xxx, setDefault] = useState(true)

  const [friend, setFriend] = useState({});


  const showProfile = () => {
       searchFriend(false)
       setProfile(true)
  }
  const hideProfile = () => {
    setProfile(false)
  }
  const closeMessage =()=>{
        showMessage(false)
  }

  const showSearchFriend = () => {
    searchFriend(true)
  }

  const hideSearchFriend = () => {
    searchFriend(false)
  }

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    if(screen.width < 768) setDefault(false)
    addResponseMessage('Welcome to this **awesome** chat!');
  }, []);

  const handleNewUserMessage = (newMessage) => {
    console.log(`New message incoming! ${newMessage}`);
    // Now send the message throught the backend API
  };

  const handleContactClick = (friend) => {
    console.log(friend)
    setFriend(friend)
    searchFriend(false);
    setProfile(false)
    showMessage(true);
  }

  useEffect(() => {
      setUid(window.localStorage.getItem("uid"))
  },[])


  
    if(!window.localStorage.getItem('uid')) navigate('/auth')
    return (
      <div className="App">
          <div className='container app-container'>
             <div className="row container-row no-gutters">
                <div className="col-sm-4 col-left">
                <Typography variant="h6" component="div" className='contacts-title'> <span>Friends</span>
                <div className="dropdown">
                    <button className="btn btn-sm btn-secondary dropdown-toggle more" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                      More
                    </button>
                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                      <a className="dropdown-item" href="#" onClick={() => showProfile()}>Profile</a>
                      <a className="dropdown-item" href="#" onClick={() => showSearchFriend()}>Search Friends</a>
                    </div>
                  </div>
                </Typography>
                <ContactList handleContactClick={handleContactClick}/>
                </div>
             
                {search || profile || message || xxx ? <div className="col-sm-8 col-right">
                {search ? <SearchFriend hideSearchFriend={hideSearchFriend}/> : profile ? <Profile></Profile> : message ?  <Message closeMessage={closeMessage} friend={friend} uid={uid}/> : <Default/>}
                </div> : <></> }
              </div>
          </div>
         
        
      </div>
    );
}

export default App;