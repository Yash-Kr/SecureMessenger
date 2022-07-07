import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import './contactlist.css'
import { Divider } from '@mui/material';
import {useState} from 'react'
import {database} from '../fire/FirebaseConfig'
import {arrayUnion, doc , onSnapshot} from "firebase/firestore"
import DataService from '../fire/FirebaseOperations'


function ContactList({handleContactClick}) {


    const [selected, setSelected] = useState(-1);

    const [friends, setFriends] = useState(["Nitish","Himanshu"]);
    function generate(element) {
        return [0, 1, 2].map((value) =>
          React.cloneElement(element, {
            key: value,
          }),
        );
      }
      
      const Demo = styled('div')(({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
      }));

      const [dense, setDense] = React.useState(false);
     const [secondary, setSecondary] = React.useState(false);

     const fetchFriends = async (uid) => {
          const Doc = doc(database,"users",uid);
          const unsubsribe = onSnapshot(Doc , async (querysnap)=>{
              let frands = await DataService.getData("users",uid);
              frands = querysnap?._document.data.value.mapValue.fields.friends.arrayValue.values;
              let temp = [];
              for(let i=0;i<frands.length;i++)
              {
                let algo = frands[i]?.mapValue.fields?.algo.integerValue;
                let avatar = frands[i]?.mapValue.fields?.avatar.stringValue;
                let name = frands[i]?.mapValue.fields?.name.stringValue;
                let uid = frands[i]?.mapValue.fields?.uid.stringValue;
                temp.push({name,avatar,uid,algo})
              }
          setFriends(temp);
        });
     }
     useState(() => {
           fetchFriends(window.localStorage.getItem('uid'));
     },[])

  return (
      <Grid  spacing={2} className="contact-list-container">
         <Grid item xs={12} md={6}>
          <Demo>
            <List dense={dense} style={{padding:0, margin:0}}>
                {friends.map((friend,index) =>
                <ListItem key={friend?.uid} className={`contact-item ${selected===index ? "selected" : ""}`} onClick={() => {setSelected(index); handleContactClick(friend)}}>
                  <ListItemAvatar>
                    <Avatar src={`./avatars/avatar${friend.avatar}.png`}>   
                    </Avatar>
                  </ListItemAvatar>
                  <div>{friend?.name}</div>
                  </ListItem>
                )}
               

                {/* <ListItem className='contact-item selected'>
                  <ListItemAvatar>
                    <Avatar src='https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg?t=st=1655198474~exp=1655199074~hmac=ca3bb2087548a65db3ea874325c883a2c486402464a77e6f9cb11f9ce3a64574&w=1800'>
                       
                    </Avatar>
                  </ListItemAvatar>
                  <div>Hello</div>
                 
                </ListItem> */}



            </List>    
          </Demo>
        </Grid>
       </Grid> 
  );
}

export default ContactList
