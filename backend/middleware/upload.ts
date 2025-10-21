import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Vercel's only writable directory is /tmp, so we must use it for file uploads.
const uploadDir = path.join('/tmp', 'uploads');

// Ensure the upload directory exists within the temporary folder.
// This is crucial for the serverless environment.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

export default upload;