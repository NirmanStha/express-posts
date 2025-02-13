import multer from "multer";
import path from "path";

// File filter to only allow image types
const fileFilter = (req: any, file: any, cb: any) => {
  let imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    cb(null, true); // Accept the file
  } else {
    req.fileTypeError = true; // Set a flag if the file is not an image
    cb(null, false); // Reject the file
  }
};

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check the fieldname to decide the storage folder
    if (file.fieldname === "posts") {
      cb(null, path.join(process.cwd(), "/src/uploads/posts")); // Store in 'posts' folder
    } else if (file.fieldname === "profilepic") {
      // Corrected the fieldname to 'profilepic'
      cb(null, path.join(process.cwd(), "/src/uploads/profiles")); // Store in 'profiles' folder
    } else {
      // If the fieldname is invalid, reject the file with an error message
      cb(new Error("Invalid fieldname"), ""); // Pass 'undefined' for the path
    }
  },
  filename: function (req, file, cb) {
    // Name the file by appending the current timestamp to the original name
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer with storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;
