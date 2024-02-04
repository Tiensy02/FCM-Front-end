import './index.css'
function BaseValue({nameBox,objectNotification,setObjectNotificaton}){ 
    const handlerInput = (e) => {
        const objectName  = e.target.name
        const objectValue = e.target.value
        if(nameBox == null) {
          setObjectNotificaton({...objectNotification,[objectName]:objectValue})
        }else {
          setObjectNotificaton({...objectNotification,[nameBox]:{...objectNotification[nameBox],[objectName]:objectValue}})
        }
    }
    return (
        <>
        <div className='login-box'>
            <div className='box-input'>
              <label className='label-input'>Title</label>
              <input className='input' defaultValue={nameBox? objectNotification?.title:''} name='title' onKeyUp={handlerInput} ></input>
            </div>
            <div className='box-input'>
              <label className='label-input'>Message</label>
              <input className='input' defaultValue={nameBox? objectNotification?.message:''} name='message'  onKeyUp={handlerInput}></input>
            </div>
        </div>
        </>
    )
}
export default BaseValue;