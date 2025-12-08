import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/constants';

export const uploadImage = async (imageUri) => {
  try {
    const formData = new FormData();
    
    // Extract file extension from URI with validation
    const uriParts = imageUri.split('.');
    const fileType = uriParts.length > 1 ? uriParts[uriParts.length - 1] : 'jpg';
    
    formData.append('file', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: `obstacle_${Date.now()}.${fileType}`,
    });
    
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
