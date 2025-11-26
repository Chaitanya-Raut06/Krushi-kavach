import multer from "multer";

const storage = multer.memoryStorage();

// IMPROVED FILE FILTER
const fileFilter = (req, file, cb) => {
  // Accept images (jpeg, png) and PDFs
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false); // Reject the file
  }
};

// Middleware for a single file upload
export const uploadSingle = (fieldName) => multer({ storage, fileFilter }).single(fieldName);

// Middleware for multiple file uploads (used for disease reports)
export const uploadMultiple = (fieldName, maxCount = 5) => multer({ storage, fileFilter }).array(fieldName, maxCount);