import SelectAction from "./selectAction"
import ImageControl from "./imageControl"
import BaseValue from "./baseValue"
import './index.css'
function ControlValue({ nameBox, objectNotification, setObjectNotification }) {
    return (
    <div className='login-box control'>
        <>{nameBox}</>
        <BaseValue nameBox={nameBox} objectNotification={objectNotification} setObjectNotificaton={setObjectNotification}></BaseValue>
        <ImageControl nameBox={nameBox} objectNotification={objectNotification} setObjectNotification={setObjectNotification}></ImageControl>
        <SelectAction nameBox={nameBox} objectNotification={objectNotification} setNotification={setObjectNotification}></SelectAction>
    </div>
    )
}
export default ControlValue