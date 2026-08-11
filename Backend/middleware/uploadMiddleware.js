const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectories = {
  images: path.join(
    __dirname,
    "..",
    "uploads",
    "images"
  ),

  documents: path.join(
    __dirname,
    "..",
    "uploads",
    "documents"
  ),

  videos: path.join(
    __dirname,
    "..",
    "uploads",
    "videos"
  ),
};

Object.values(uploadDirectories).forEach(
  (directory) => {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {
        recursive: true,
      });
    }
  }
);

const createStorage = (directory) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, directory);
    },

    filename: (req, file, cb) => {
      const extension = path.extname(
        file.originalname
      );

      const baseName = path
        .basename(
          file.originalname,
          extension
        )
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}-${baseName}${extension}`;

      cb(null, uniqueName);
    },
  });
};

const imageFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPEG, JPG, PNG, WEBP and GIF images are allowed."
      ),
      false
    );
  }
};

const documentFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported document format."
      ),
      false
    );
  }
};

const videoFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "video/mp4",
    "video/mpeg",
    "video/webm",
    "video/quicktime",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only MP4, MPEG, WEBM and MOV videos are allowed."
      ),
      false
    );
  }
};

const imageUpload = multer({
  storage: createStorage(
    uploadDirectories.images
  ),

  fileFilter: imageFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const documentUpload = multer({
  storage: createStorage(
    uploadDirectories.documents
  ),

  fileFilter: documentFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const videoUpload = multer({
  storage: createStorage(
    uploadDirectories.videos
  ),

  fileFilter: videoFilter,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const anyFileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(
        null,
        uploadDirectories.documents
      );
    },

    filename: (req, file, cb) => {
      const extension = path.extname(
        file.originalname
      );

      const name = `file-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

      cb(null, name);
    },
  }),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = {
  imageUpload,
  documentUpload,
  videoUpload,
  anyFileUpload,
  uploadDirectories,
};