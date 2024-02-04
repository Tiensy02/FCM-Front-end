import { useEffect, useState } from 'react';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import BackupIcon from '@mui/icons-material/Backup';
import './image-upload.css'
function ImageUploader() {


  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleImageChange = (event) => {

    const selectedFiles = event.target.files;
    for (let i = 0; i < selectedFiles.length; i++) {
      const selectedFile = selectedFiles[i];
   
      if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          setImages((prevImages) => [...prevImages, reader.result]);
          setSelectedImages((prevSelectImages) => [...prevSelectImages,selectedFile])
        };
        reader.readAsDataURL(selectedFile);
      }
      
    }
    
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    const newSelectedImages = [...selectedImages];
    newSelectedImages.splice(index, 1);
    setSelectedImages(newSelectedImages);
  };
  return (
    <div style={{marginBottom:'24px'}}>
      <p className='image-upload-title'> Hình ảnh</p>

      <input
        type="file"
        id="image-upload"
        onChange={handleImageChange}
        style={{ display: "none" }}
        multiple
      />
      <div className='image-wrap' >
        <div className="image-preview">
          {images.map((image, index) => (
            <div key={index} className="image-preview-item">
              <img src={image} alt={`Preview ${index}`} style={{ height: "64px", width: "64px" }} />
              <div onClick={() => {
                handleRemoveImage(index)
              }}>
                <RemoveCircleIcon className='close-image' style={{ color: "red", fontSize: "16px" }}></RemoveCircleIcon>
              </div>
            </div>
          ))}
        </div>
        <label htmlFor="image-upload" className='btn-upload-image'>
          <BackupIcon style={{color:"rgb(0 104 224)",fontSize:"32px"}} /> 
          {selectedImages.length == 0 && "Upload File"}
        </label>
      </div>
    </div>
  );
}

export default ImageUploader;
