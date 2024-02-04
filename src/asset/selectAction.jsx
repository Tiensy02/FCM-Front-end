import { useRef, useState } from "react"
const actions = ['Home', 'Notification', 'Workspace', "Link"]
function SelectAction({ objectNotification, setNotification }) {
    const [action, setAction] = useState('Home')
    const inputRef = useRef(null)
    const handlerChange =(e) => {
        setAction(e.target.value)
    }
    return (
        <>
            <label htmlFor="actions">chọn hành động chỉ định</label>

            <select name="actions" id="actions" onChange={handlerChange}>
                {actions.map((elm,index) => (
                    <option value={elm} key={index}>{elm}
                    </option>
                ))}
            </select>
            {action == 'Link' && (<input ref={inputRef}></input>)}
            <button style={{width:'80px'}} onClick={() => {
                setNotification(preValue => {
                    if (action == "Link") {
                        return { ...preValue, action: inputRef.current.value  }
                    } else {
                        return { ...preValue,  action: action  }
                    }
                })
            }}>Xong</button>
        </>
    )
}
export default SelectAction