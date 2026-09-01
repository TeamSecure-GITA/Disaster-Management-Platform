const multer = require("multer");
const path = require("path");
const fs = require("fs");
const environment = require("../config/environment");

const maxFileSize = environment.maxFileSize;

const uploadDirectories = {
  images: path.join(
    __dirname,
    "..",
    environment.uploadDirectory,
    "images"
  ),

  documents: path.join(
    __dirname,
    "..",
    environment.uploadDirectory,
    "documents"
  ),

  videos: path.join(
    __dirname,
    "..",
    environment.uploadDirectory,
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
    fileSize: Math.min(5 * 1024 * 1024, maxFileSize),
  },
});

const documentUpload = multer({
  storage: createStorage(
    uploadDirectories.documents
  ),

  fileFilter: documentFilter,

  limits: {
    fileSize: maxFileSize,
  },
});

const videoUpload = multer({
  storage: createStorage(
    uploadDirectories.videos
  ),

  fileFilter: videoFilter,

  limits: {
    fileSize: Math.min(100 * 1024 * 1024, maxFileSize),
  },
});

// Mixed media upload — accepts images + short videos (≤ 50 MB).
// Used exclusively by the incident reporting route so field officers
// can attach both photos and short video clips of slope cracks / floods.
const mixedMediaFilter = (req, file, cb) => {
  const allowedImages = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const allowedVideos = [
    "video/mp4",
    "video/mpeg",
    "video/webm",
    "video/quicktime",
  ];

  if (
    allowedImages.includes(file.mimetype) ||
    allowedVideos.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPEG, PNG, WEBP, GIF images and MP4, WEBM, MOV videos are allowed for incident media."
      ),
      false
    );
  }
};

const mixedMediaUpload = multer({
  storage: createStorage(uploadDirectories.images),
  fileFilter: mixedMediaFilter,
  limits: {
    // 50 MB cap — large enough for a short video clip, safe for bandwidth
    fileSize: Math.min(50 * 1024 * 1024, maxFileSize),
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
    fileSize: maxFileSize,
  },
});

const defaultStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectories.documents);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`;
    cb(null, uniqueName);
  },
});

const defaultFilter = (_req, _file, cb) => cb(null, true);

const createUploadMiddleware = ({
  storage = defaultStorage,
  fileFilter = defaultFilter,
  limits = { fileSize: 10 * 1024 * 1024 },
} = {}) => {
  return multer({ storage, fileFilter, limits });
};

const array = (fieldName, maxCount, options = {}) => {
  const upload = createUploadMiddleware(options);
  return upload.array(fieldName, maxCount);
};

const single = (fieldName, options = {}) => {
  const upload = createUploadMiddleware(options);
  return upload.single(fieldName);
};

const fields = (fields, options = {}) => {
  const upload = createUploadMiddleware(options);
  return upload.fields(fields);
};

module.exports = {
  imageUpload,
  documentUpload,
  videoUpload,
  anyFileUpload,
  mixedMediaUpload,
  uploadDirectories,
  array,
  single,
  fields,
  createUploadMiddleware,
};