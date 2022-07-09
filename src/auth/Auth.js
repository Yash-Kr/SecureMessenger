import React from 'react'
import { useState } from 'react'
import './auth.css'
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { Avatar } from '@mui/material';
import { auth, provider } from '../fire/FirebaseConfig'
import { signInWithPopup } from "firebase/auth";
import DataService from '../fire/FirebaseOperations'
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';


function Auth() {

  const [avatar, setAvatar] = useState(1);
  const navigate = useNavigate();

  const uploadImage =   (img) => {
    setAvatar(img);
   }

   const [success, setSucess] = useState(false)

   
   const [drawer, setDrawer] = useState(false);

   const toggleDrawer = () => {
       setDrawer(!drawer);
   }

   const colors = ["#ffdb4e", "#00fe9b", "#2dd9fe", "#9461fd", "#FF53cd", "#FF5161"]

   const handleLogin = () => {
      signInWithPopup(auth, provider)
      .then( async (result) => {
         try {
            const exist = await DataService.getData("users",result.user.uid);
            if (exist._document === null) {
                window.alert("No user exists !! Please Sign up first");
            }else{
                window.localStorage.setItem("uid",result.user.uid);
                window.localStorage.setItem("uname",result.user.displayName);
                window.localStorage.setItem("uavatar",avatar);
                window.localStorage.setItem("uemail",result.user.email);
                let data = await DataService.getData("users",result.user.uid)
                let keyGenerated = data?._document?.data?.value?.mapValue?.fields?.keyGenerated?.booleanValue;
                if(keyGenerated === true) navigate('/')
                else navigate('/keyconfig')
            }
        } catch (e) {
            console.error("Error occured");
        }

      })
      .catch((error) => {
        console.log(error);
      });
   }

   const handleSignup = () => {
        signInWithPopup(auth, provider)
        .then( async (result) => {
        // console.log(result.user.uid)
        try {
            const exist = await DataService.getData("users",result.user.uid);
            console.log(exist)
            if (exist._document === null) {
                window.localStorage.setItem("uid",result.user.uid);
                window.localStorage.setItem("uname",result.user.displayName);
                window.localStorage.setItem("uavatar",avatar);
                window.localStorage.setItem("uemail",result.user.email);
                DataService.addData("users",result.user.uid,{ name : result?.user?.displayName ,email : result?.user?.email , avatar : avatar, keyGenerated : false, uid : result?.user?.uid, friends : []})
                setSucess(true);
                setTimeout(() => {
                    navigate('/keyconfig')
                },1000)
            }else{
                window.alert("Account Already exixts");
            }
        } catch (e) {
            console.error("Error occured");
        }

        })
        .catch((error) => {
        console.log(error);
        });
   }


   const list = (
    <Box
      sx={{ height:"250px", }}
      role="presentation"
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
      className='drawer'
    >
        
        <div className="container">
            <div className="row">
                <div className="col col-sm-4">
                    <img src='./avatars/avatar1.png' alt='avatar' onClick={() => uploadImage(1)}></img>
                </div>
                <div className="col col-sm-4">
                    <img src='./avatars/avatar2.png' alt='avatar' onClick={() => uploadImage(2)}></img>
                </div>
                <div className="col col-sm-4">
                    <img src='./avatars/avatar3.png' alt='avatar' onClick={() => uploadImage(3)}></img>
                </div>
            </div>

            <div className="row">
                <div className="col col-sm-4">
                   <img src='./avatars/avatar4.png' alt='avatar' onClick={() => uploadImage(4)}></img>
                </div>
                <div className="col col-sm-4">
                <img src='./avatars/avatar5.png' alt='avatar' onClick={() => uploadImage(5)}></img>
                </div>
                <div className="col col-sm-4">
                <img src='./avatars/avatar6.png' alt='avatar' onClick={() => uploadImage(6)}></img>
                </div>
            </div>

            <div className="row">
                <div className="col col-sm-4">
                <img src='./avatars/avatar7.png' alt='avatar' onClick={() => uploadImage(7)}></img>
                </div>
                <div className="col col-sm-4">
                <img src='./avatars/avatar7.png' alt='avatar' onClick={() => uploadImage(8)}></img>
                </div>
                <div className="col col-sm-4">
                <img src='./avatars/avatar9.png' alt='avatar' onClick={() => uploadImage(9)}></img>
                </div>
            </div>

            <div className="row">
                <div className="col col-sm-4">
                <img src='./avatars/avatar10.png' alt='avatar' onClick={() => uploadImage(10)}></img>
                </div>
                <div className="col col-sm-4">
                <img src='./avatars/avatar3.png' alt='avatar' onClick={() => uploadImage(11)}></img>
                </div>
                <div className="col col-sm-4">
                <img src='./avatars/avatar3.png' alt='avatar' onClick={() => uploadImage(12)}></img>
                </div>
            </div>

        </div>
    </Box>
  );


  
  return (
	<div className="section auth-container">
    <div className="container">
    <div data-aos="fade-right" data-aos-duration="1500" className='app-name'>  <h1 >Secure Messenger <img src='./img/shield.png'></img> </h1></div>
        <div className="row justify-content-center">
            <div className="col-12 text-center align-self-center">
                <div className="section pb-5 pt-5 pt-sm-2 text-center">
                    <h6 className="mb-0 pb-3"><span>Log In </span><span>Sign Up</span></h6>
                      <input className="checkbox" type="checkbox" id="reg-log" name="reg-log"/>
                      <label for="reg-log"></label>
                    <div className="card-3d-wrap mx-auto">
                        <div className="card-3d-wrapper">
                            <div className="card-front">
                                <div className="center-wrap">
                                    <div className="section text-center">
                                        <h4 className="mb-4 pb-3">Log In</h4>
                
                                        <div className="form-group mt-2">
                                        <a href="#" className="btn-auth btn-auth-social btn-auth-google" onClick={() => handleLogin()}><i className="fa fa-google"> <span className="iconify google" data-icon="akar-icons:google-fill"></span></i> Log in with Google</a>
                                        </div>
                                      </div>
                                  </div>
                              </div>
                            <div className="card-back">
                                <div className="center-wrap">
                                    <div className="section text-center">
                                        <h4 className="mb-4 pb-3">Sign Up</h4>
                                        <Alert className='alert-signup' style={{display:`${success ? 'flex' : 'none'}`}}> Account Created Successfully !</Alert>
                                        <div className='avatar'>
                                            <img src={ `./avatars/avatar${avatar}.png`} alt='avatar'></img>
                                            <label for="image-uploader" className="image-selector">
                                             <div>
                                                   
                                                    <Button onClick={toggleDrawer}>Choose your avatar</Button>
                                                    <Drawer
                                                        anchor='bottom'
                                                        open={drawer}
                                                        onClose={toggleDrawer}
                                                        variant='persistent'
                                            
                                                    >
                                                        {list}
                                                    </Drawer>
                                                   

                                                </div>
                                            </label>

                                            {/* <input type="file"  id='image-uploader' onChange={uploadImage} style={{display:"none"}}/> */}
                                        </div>

                                         <a href="#" className="btn-auth btn-auth-social btn-auth-google" onClick={() => handleSignup()}><i className="fa fa-google"> <span className="iconify google" data-icon="akar-icons:google-fill"></span></i> Sign up with Google</a>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
    </div>
    <div className='footer'>Made with &#9829; by  <a id='yash'  href='https://www.linkedin.com/in/yash-kr/' target="_blank"> Yash</a></div>
          <a className='github-btn' href='https://github.com/Yash-Kr/SecureMessenger' target="_blank">Give it a<span style={{color:"yellow"}}>	&#11088;</span> on Github !</a>
</div>
  )
}

export default Auth