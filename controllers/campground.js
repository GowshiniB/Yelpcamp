const Campground = require("../models/campground");
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeoCoding({accessToken: mapBoxToken});
const {cloudinary} = require("../cloudinary");

module.exports.index = async(req,res)=>{
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm = (req,res)=>{
  res.render('campgrounds/new');
}

module.exports.createCampground = async(req,res,next)=>{
  // if(!req.body.campground) throw new ExpressError("Invalid Campground Data",400);
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map(f =>({url: f.path, filename: f.filename}));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success","Successfully made a new campground!");
  res.redirect(`campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req,res)=>{
  const campground = await Campground.findById(req.params.id).populate({
    path:'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author');
  console.log(campground);
  if(!campground){
    req.flash('error',"OOPS! No such campground exists :(");
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show',{campground});
}

module.exports.renderEditForm = async(req, res)=>{
  const {id} = req.params;
  const campground = await Campground.findById(id);
  if(!campground.author.equals(req.user._id)){
    req.flash("error","You don't have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground = async(req, res)=>{
  const {id} = req.params;
  //using spread operator for object
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
  const imgs = req.files.map(f =>({url: f.path, filename: f.filename}));
  campground.images.push(...imgs); //spread operator
  await campground.save();
  if(req.body.deleteImages){
    for(let filename of req.body.deleteImages){ // to delete in cloudinary
      await cloudinary.uploader.destroy(filename)
    }
    //to delete images from our database
    await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    
  }
  req.flash("success",`Successfully updated your campground!!!`)
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async(req,res)=>{
  const {id} = req.params;
  const campground = await Campground.findByIdAndDelete(id); //triggers the 'findOneAndDelete' middleware in campground.js file
  req.flash("success",`Your ${campground.title} campground has been deleted!`);
  res.redirect('/campgrounds');
}