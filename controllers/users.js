const User = require('../models/user');

module.exports.renderRegister = (req,res)=>{
  res.render('users/register');
}

module.exports.register = async (req,res)=>{
  try{
    const {email, username, password} = req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,err=>{
      if(err) return next(err);
      console.log(registeredUser);
      req.flash('success',"Welcome to Yelp Camp");
      res.redirect('/campgrounds');
    });
  }
  catch(error){
    req.flash('error',"Oops! Please Enter Valid Credentials or user may exists already");
    //req.flash('error',error.message);
    res.redirect('/register');
  }
}

module.exports.renderLogin = (req,res)=>{
  res.render('users/login');
}

module.exports.login = (req,res)=>{
  req.flash('success','Welcome Back!!');
  const redirectUrl =  req.session.returnTo || '/campgrounds';
  //delete req.session.returnTo; //emptying the returnTo thing
  res.redirect(redirectUrl);
}

module.exports.logout = (req,res)=>{
  req.logout();
  req.flash('success',"Goodbye T T");
  res.redirect('/campgrounds');
}
