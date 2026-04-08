export function getCloudinaryConfig() {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "",
  };
}

export function canUploadToCloudinary() {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  return Boolean(cloudName && uploadPreset);
}
