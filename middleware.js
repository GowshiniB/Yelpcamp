const ExpressError = require('./utils/ExpressError');
const {campgroundSchema,reviewSchema} = require("./schemas");
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next)=>{
  // console.log("request user...",req.user);
 // console.log(req.path,req.originalUrl);
  req.session.returnTo = req.originalUrl;
  if(!req.isAuthenticated()){
    req.flash('error',"You must be logged in :(");
    return res.redirect('/login');
  }
  next();
}

//joi validation
module.exports.validateCampground = (req,res,next)=>{
  const {error} =  campgroundSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el=>el.message).join(",")
    throw new ExpressError(msg, 400);
  }else{
    next();
  }
}

//middleware to check if the logged in user is the author of the campground
module.exports.isAuthor = async(req,res,next)=>{
  const {id} = req.params;
  const campground = await Campground.findById(id);
  if(!campground.author.equals(req.user._id)){
    req.flash('error',"OOPS! You don't have permission to do that -_-");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

//middleware to check the review's author
module.exports.isReviewAuthor = async(req,res,next)=>{
  const {id, reviewId} = req.params;
  const review = await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)){
    req.flash('error',"OOPS! You don't have permission to do that -_-");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}


//middleware to validate review
module.exports.validateReview = (req,res,next)=>{
  const {error} = reviewSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el=>el.message).join(",")
    throw new ExpressError(msg, 400);
  }else{
    next();
  }
}