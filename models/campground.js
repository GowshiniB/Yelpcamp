const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: String, 
  filename: String
});

imageSchema.virtual('thumbnail').get(function(){
  return this.url.replace('/upload','/upload/w_200'); // cloudinary width set to image - thumbnail 
});

const opts = {toJSON: {virtuals: true}};

const campgroundSchema = new Schema({
  title: String,
  images: [imageSchema],
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews:[{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, opts);



campgroundSchema.virtual('properties.popUpMarkup').get(function(){
  return  `<strong><a href="/campgrounds/${this._id}" style="text-decoration: none;">${this.title}</a></strong>`; // cloudinary width set to image - thumbnail 
});

// mongoose query middleware for deleting reviews after deleting the corrresponding campground
campgroundSchema.post('findOneAndDelete',async function(doc){
  if(doc){
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})
module.exports = mongoose.model("Campground",campgroundSchema);