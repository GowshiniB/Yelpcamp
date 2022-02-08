if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}
//console.log(process.env.SECRET);

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const flash = require("connect-flash");
const passport  = require('passport');
const localStrategy = require('passport-local');
const User= require('./models/user');
const mongoSanitize = require("express-mongo-sanitize");
const usersRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const helmet = require('helmet');
const { contentSecurityPolicy } = require('helmet');

const session = require("express-session");
const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, async(err)=>{
  if(err) throw err;
    console.log("Database connected successfully!")
});


app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));

app.engine('ejs',ejsMate);

//telling express to parse the request body
app.use(express.urlencoded({extended: true}));

//tell express to use method-override
app.use(methodOverride('_method'));

//making the public directory public
app.use(express.static(path.join(__dirname,'public'))); 

//prevents mongo injection
app.use(mongoSanitize({
  replaceWith: '_'
}));
app.use(helmet({
  contentSecurityPolicy: false
}));


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
});

store.on("error",function(e){
  console.log("SESSION STORE ERROR",e);
})


const sessionConfig={
  store:store,
  name: "This is your default session id",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: { //options for cookies
    httpOnly: true,
    // secure: true, //only works on https but localhost is not https so it breaks our app flow
    expires: Date.now() + 1000*60 *60*24*7,
    maxage: 1000*60 *60*24*7
  }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

//content security policy starts here
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/doin3snx5/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
//content security policy ends here

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

//storing and unstoring the user in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
 // console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});




app.get('/fakeUser',async(req,res)=>{
  const user = new User({email: "gowshini@gmail.com",username: "Gowshini"});
  const newUser = await User.register(user,'tobato'); //User.register takes instance of the model and the password of the user(from passport mongoose) and changes into hash function
  res.send(newUser);
});

//using the routes
app.use('/',usersRoutes);
app.use("/campgrounds",campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes); // if you need access id
// from the params then you have to merge params in another file

app.get('/',(req,res)=>{
  res.render("home.ejs");
});


// app.get('/makecampground',async (req,res)=>{
//   const camp = new Campground({
//     title: "My Backyard", description: "I don't really have one :( "
//   })
//   await camp.save();
//   res.send(camp);
// })\


//for every single request all, for every single path *
app.all('*', (req,res,next)=>{
  next(new ExpressError("Page Not Found :(", 404));
});

app.use((err, req, res, next)=>{
  const{statusCode=500} = err;
  if(!err.message) err.message = "Oh No! Something went wrong :(";
  res.status(statusCode).render('error',{err});
});

const port = process.env.PORT || 3000;
app.listen(port,()=>{
  console.log(`listening on port ${port}....`);
});