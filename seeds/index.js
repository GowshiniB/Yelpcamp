//importing cities
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const mongoose = require("mongoose");
//2 dots for back out one directory
const Campground = require("../models/campground");

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log("Mongoose connection opened!!");
})
.catch((e)=>{
    console.log("Mongoose Connection unsuccessfull");
    console.log(e);
})
const sample = (array)=> array[Math.floor(Math.random()*array.length)];
const seedDB = async() =>{
  await Campground.deleteMany({});
  for(let i=0;i<200;i++){
    //there are 1000 cities
    const random1000 = Math.floor(Math.random()*1000);
    const pricepn = Math.floor(Math.random()*30)+10;
    const camp = new Campground({
      //Your user id
      author: "61c6f8b73889d50a93d2282f",
      title: `${sample(descriptors)}, ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Corporis autem quibusdam optio adipisci, distinctio inventore ut minima quis quam saepe iusto ad quaerat doloribus molestias aliquam! Nam animi minima mollitia.",
      price: `${pricepn}`,
      geometry: { 
        type: 'Point', 
        coordinates: [ 
          cities[random1000].longitude,
          cities[random1000].latitude
        ] 
      },
      images: [
        {
          url: 'https://res.cloudinary.com/doin3snx5/image/upload/v1640694022/Yelpcamp/c9zc72t5ymbd3ld3gilr.jpg',
          filename: 'Yelpcamp/c9zc72t5ymbd3ld3gilr'
        },
        {
          url: 'https://res.cloudinary.com/doin3snx5/image/upload/v1640694022/Yelpcamp/a0prxbk9zimpff4tfbl4.jpg',
          filename: 'Yelpcamp/a0prxbk9zimpff4tfbl4'
        }
    
      ]
    })
    await camp.save();
  }
}
seedDB().then(()=>{
  //to close the mongoose connection
  mongoose.connection.close();
})