const fs = require("fs/promises");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");

const getProvider = () =>
    (process.env.CLOUD_STORAGE_PROVIDER || "local").toLowerCase();

const isCloudinaryConfigured = () =>
    Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

const configureCloudinary = () => {
    if (!isCloudinaryConfigured()) {
        throw new Error(
            "Cloudinary storage is selected but CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are not configured."
        );
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
};

const removeTemporaryFile = async (filePath) => {
    if (!filePath) return;

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Failed to remove temporary upload:", error.message);
        }
    }
};

const uploadFile = async (file, { folder = "disaster-management" } = {}) => {
    if (!file?.path) {
        throw new Error("A valid uploaded file is required.");
    }

    if (getProvider() !== "cloudinary") {
        return {
            url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`,
            filename: file.filename,
            provider: "local",
            publicId: null,
            resourceType: null,
            bytes: file.size,
        };
    }

    configureCloudinary();

    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder,
            resource_type: "auto",
            use_filename: false,
            unique_filename: true,
        });

        return {
            url: result.secure_url,
            filename: file.filename,
            provider: "cloudinary",
            publicId: result.public_id,
            resourceType: result.resource_type,
            bytes: result.bytes,
        };
    } finally {
        await removeTemporaryFile(file.path);
    }
};

const deleteFile = async ({ provider, publicId, resourceType = "image" } = {}) => {
    if (provider !== "cloudinary" || !publicId) return;

    configureCloudinary();
    await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
    });
};

module.exports = {
    getProvider,
    isCloudinaryConfigured,
    uploadFile,
    deleteFile,
    removeTemporaryFile,
};