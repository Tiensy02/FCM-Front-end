import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import '../src/asset/index.css';
import { logout,createToken, login } from './firebase/reciveci.js'
import { messaging } from "./firebase/index.js";
import BaseValue from './asset/baseValue.jsx';
import {  onMessage } from "firebase/messaging";
import ImageControl from './asset/imageControl.jsx';
import SelectAction from './asset/selectAction.jsx';
const deviceDefault = ['web', 'android', 'ios']
function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deviceSelects, setDeviceSelects] = useState([])
  const [user,setUser]= useState({})
  const [isAll, setIsAll] = useState(false)
  const inputAcount = useRef(null);
  const inputPass = useRef(null);
  const [objectNotification, setObjectNotidication] = useState({})
  useEffect( () => {
    console.log(messaging)
    createToken()
    
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
    });
  }, [])
  const changeDevice = (e) => {
    const valueDevice = e.target.value

    if (valueDevice != 'all') {
      if (e.target.checked) {
        setDeviceSelects([...deviceSelects, valueDevice])
      } else {
        if (deviceSelects.includes(valueDevice)) {
          if (deviceSelects.includes(valueDevice)) {
            const index = deviceSelects.indexOf(valueDevice)
            setDeviceSelects(preValue => {
              const arr = preValue.slice()
              arr.splice(index, 1)
              return arr
            })
          }

        }
      }
    } else {
      if (e.target.checked) {
        setDeviceSelects(deviceDefault.slice())
      } else {
        setDeviceSelects([])
      }
    }

  }
  useEffect(() => {

    let checkAll = true
    deviceDefault.forEach(elm => {
      if (!deviceSelects.includes(elm)) {
        checkAll = false
      }
    })
    setIsAll(checkAll)
  }, [deviceSelects])

  const handlerSendNotifi = () => {
    const result = {
      pattern:"f88",
      title: objectNotification['title'],
      message: objectNotification['message'],
      image: objectNotification.image ?? null,
      devices: deviceSelects.length == 0 ? null : deviceSelects.join("; "),
      action:objectNotification?.action ?? "Home",
    }
    console.log(JSON.stringify(result))
    console.log(result)
    fetch('http://localhost:8080/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    })
      .then(response => console.log(response))
      .catch(error => console.error('Error:', error));
  }

  return (
    <div className="App">
      {isLogin &&
        <div className='login-box'>
          <div className='box-input'>
            <label className='label-input'>Tài khoản</label>
            <input className='input' ref={inputAcount}></input>
          </div>
          <div className='box-input'>
            <label className='label-input'>Mật khẩu</label>
            <input className='input' ref={inputPass}></input>
          </div>
          <button onClick={async () => {
            await login(inputAcount.current.value, inputPass.current.value,"f88")
            const user = JSON.parse(localStorage.getItem("userData"));
            setUser(user)
            if (user?.admin) {
              setIsAdmin(true)
            }
            setIsLogin(false)
          }}>Đăng nhập</button>
          
        </div>
      }
      {(!isLogin && !isAdmin) && <>{user?.userName}
      <button onClick={
        ()=>{
          logout()
          setIsLogin(true)
        }
      }>đăng xuất</button>
      </>}
      {(!isLogin && isAdmin) &&
        <div className='admin-console'>
          <div className='login-box'>
            <BaseValue objectNotification={objectNotification} setObjectNotificaton={setObjectNotidication}></BaseValue>
            <ImageControl objectNotification={objectNotification} setObjectNotification={setObjectNotidication} ></ImageControl>
            <SelectAction objectNotification={objectNotification} setNotification={setObjectNotidication}></SelectAction>
            <div className='box-input'>
              <p>Gửi tới thiết bị</p>
              <div className='device-option-wrap'>
                {deviceDefault.map((elm, index) => (
                  <div key={index} className='device-option'>
                    <input type="checkbox" checked={deviceSelects.includes(elm)} id={elm} name="selectDevice" value={elm} onChange={changeDevice}></input>
                    <label htmlFor={elm}>{elm}</label>
                  </div>
                ))}
                <div className='device-option'>
                  <input type="checkbox" id='all-device' checked={isAll} onChange={changeDevice} name="selectDevice" value="all"></input>
                  <label htmlFor="all-device">Tất cả</label>
                </div>
              </div>
            </div>
          </div>

          <button className='button-noti' onClick={()=> {
            console.log(objectNotification)
            handlerSendNotifi()
          }}>Gửi thông báo</button>

        </div>
      }
    </div>
  );
}

export default App;
