const express = require('express');
const router = express.Router({mergeParams: true}); // the params from app.js can be used by this file
const {isLoggedIn,isReviewAuthor,validateReview} = require('../middleware');
const reviews = require('../controllers/reviews');

const Review = require("../models/review");
const Campground = require("../models/campground");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");



router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn,isReviewAuthor, catchAsync(reviews.deleteReview));



module.exports = router;