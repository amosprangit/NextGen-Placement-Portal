const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ApiError } = require('../utils/apiResponse');

const makeStorage = (subfolder) => {
  const dest = path.join(__dirname, '..', '..', 'uploads', subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeBase = path
        .basename(file.originalname, ext)
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase()
        .slice(0, 40);
      cb(null, `${req.user._id}-${safeBase}-${Date.now()}${ext}`);
    },
  });
};

const resumeFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Resume must be a PDF or Word document'));
  }
  cb(null, true);
};

const nocFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new ApiError(400, 'NOC must be a PDF, JPEG or PNG'));
  }
  cb(null, true);
};

// Routes a mixed fieldname upload (resume vs noc) to the right filter/folder
// based on which field is currently being streamed.
const studentDocFilter = (req, file, cb) => {
  if (file.fieldname === 'noc') return nocFilter(req, file, cb);
  return resumeFilter(req, file, cb);
};

const imageFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Logo must be a PNG, JPEG or WEBP image'));
  }
  cb(null, true);
};

const maxBytes = () => (parseInt(process.env.MAX_UPLOAD_MB, 10) || 5) * 1024 * 1024;

const uploadResume = multer({
  storage: makeStorage('resumes'),
  fileFilter: resumeFilter,
  limits: { fileSize: maxBytes() },
});

const uploadLogo = multer({
  storage: makeStorage('logos'),
  fileFilter: imageFilter,
  limits: { fileSize: maxBytes() },
});

// Student profile update can include a resume AND/OR a NOC in the same
// request — route each fieldname to its own uploads subfolder.
const studentDocsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = file.fieldname === 'noc' ? 'noc' : 'resumes';
    const dest = path.join(__dirname, '..', '..', 'uploads', subfolder);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .slice(0, 40);
    cb(null, `${req.user._id}-${file.fieldname}-${safeBase}-${Date.now()}${ext}`);
  },
});

const uploadStudentDocs = multer({
  storage: studentDocsStorage,
  fileFilter: studentDocFilter,
  limits: { fileSize: maxBytes() },
});

module.exports = { uploadResume, uploadLogo, uploadStudentDocs };
