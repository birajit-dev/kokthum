const { request } = require('express');
var express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/news');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

module.exports = upload.single('myFile'); // make sure 'myFile' matches the field name in your frontend
