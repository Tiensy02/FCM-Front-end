import { useEffect, useState } from "react"
import './image.css'
import { ref, getDownloadURL,listAll,uploadBytesResumable } from "firebase/storage"
import {storage} from '../firebase/index.js'
function ImageControl({objectNotification, setObjectNotification}) {
    const [images, setImages] = useState([])
    const [imageSelected, setImageSelected] = useState()
    useEffect(()=> {
        const storageRef = ref(storage)
        listAll(storageRef).then(result => {
            result.items.forEach(itemRef => {
              // Get the download URL for each file
              
              getDownloadURL(itemRef).then(downloadURL => {
                
                setImages(preValue => {
                    if(!preValue.includes(downloadURL)) {
                        const result = [...preValue,downloadURL]
                        return result
                    }
                    return preValue
                })
              }).catch(error => {
                console.error('Error getting download URL:', error);
              });
            });
          }).catch(error => {
            console.error('Error listing files:', error);
          });
    },[images])

   
    const handlerChange = (event)=> {
        const file = event.target.files[0]
        const storageRef = ref(storage,`${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file);
 
    uploadTask.on(
        "state_changed",
        (snapshot) => {
           
        },
        (err) => console.log(err),
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                setImages(preValue => {
                    if(!preValue.includes(downloadURL)) {
                        const result = [...preValue,downloadURL]
                        console.log(result)
                        return result
                    }
                    return preValue
                })
            });
        }
    ); 
    }

    return (
        <div className="image-wrap">
            {images.map((elem,index) => (
                <div key={index} style={elem===imageSelected? {padding:'10px', border:'blue', backgroundColor:' rgba(136, 192, 242,0.4)'}:{}}>
                    <div  className="image-elm" style={{backgroundImage:`url(${elem})`}} onClick={()=> {setImageSelected(elem)}}>
                    </div>
                </div>
                
            ))}
            <div className="action-image">
            <input type="file" onChange={handlerChange}></input>
            <button className="button-action" onClick={()=> {
                setObjectNotification({...objectNotification, image:imageSelected})
            }}>Xong</button>
            </div>
        </div>
    )
}
export default ImageControl