const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid image type");

    if (isValid) error = null;

    cb(error, "uploads/");
  },

  filename: function (req, file, cb) {
    const name = file.originalname.split(" ").join("-");
    const ext = FILE_TYPE_MAP[file.mimetype];

    cb(null, `${name}-${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
