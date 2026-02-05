const cloudinary = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage for different upload types
const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) => {
    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `servicebee/${folder}`,
            allowed_formats: allowedFormats,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        }
    });
};

// Storage configurations
const companyLogoStorage = createStorage('logos');
const serviceImageStorage = createStorage('services');
const complaintImageStorage = createStorage('complaints');
const userAvatarStorage = createStorage('avatars');

// Helper to run multer as promise (compatible with multer v2)
const runMulter = (multerMiddleware) => {
    return (req, res) => {
        return new Promise((resolve, reject) => {
            multerMiddleware(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };
};

// Multer upload middleware (for use in routes)
const uploadCompanyLogoMiddleware = multer({
    storage: companyLogoStorage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
}).single('logo');

const uploadServiceImageMiddleware = multer({
    storage: serviceImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('image');

const uploadComplaintImagesMiddleware = multer({
    storage: complaintImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB per image
}).array('images', 3); // Max 3 images

const uploadUserAvatarMiddleware = multer({
    storage: userAvatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
}).single('avatar');

// Promise-based wrappers for controller use
const uploadCompanyLogo = runMulter(uploadCompanyLogoMiddleware);
const uploadServiceImage = runMulter(uploadServiceImageMiddleware);
const uploadComplaintImages = runMulter(uploadComplaintImagesMiddleware);
const uploadUserAvatar = runMulter(uploadUserAvatarMiddleware);

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        if (!publicId) return;
        await cloudinary.v2.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};

// Extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary')) return null;
    const parts = url.split('/');
    const filenameWithExt = parts[parts.length - 1];
    const folder = parts.slice(-3, -1).join('/');
    const filename = filenameWithExt.split('.')[0];
    return `${folder}/${filename}`;
};

module.exports = {
    cloudinary,
    uploadCompanyLogo,
    uploadServiceImage,
    uploadComplaintImages,
    uploadUserAvatar,
    uploadCompanyLogoMiddleware,
    uploadServiceImageMiddleware,
    uploadComplaintImagesMiddleware,
    uploadUserAvatarMiddleware,
    deleteImage,
    getPublicIdFromUrl
};
