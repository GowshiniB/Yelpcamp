const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campground');
const catchAsync = require("../utils/catchAsync");
const {isLoggedIn,validateCampground,isAuthor} = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
  // .post(upload.array('image'), (req,res)=>{
  //   // console.log(req.body, req.files);
  //   res.send("IT WORKED");
  // });

router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(campgrounds.renderEditForm));

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn,isAuthor,upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground));



module.exports = router;