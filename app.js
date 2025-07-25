const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session=require('express-session')
const flash=require('connect-flash')
const ejsMate = require('ejs-mate');
const passport=require('passport')
const LocalStrategy=require('passport-local')
const methodOverride = require('method-override');

const ExpressError = require('./utils/ExpressError');

const userRoutes=require('./routes/users.js')
const campgroundRoutes = require('./routes/campgrounds.js')
const reviewRoutes=require('./routes/reviews.js')

const User=require('./models/user.js')


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


const sessionConfig={
    secret: 'secret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error')
    res.locals.currentUser=req.user;
    next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})