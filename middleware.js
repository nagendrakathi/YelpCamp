module.exports.isLoggedIn=(req, res, next)=>{
    if(!req.isAuthenticated()){
        // console.log(req)
        req.session.returnTo = req.originalUrl; 
        req.flash('error', 'You must login to create campground')
        return res.redirect('/login')
    } 
    next();
}
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}
// module.exports.