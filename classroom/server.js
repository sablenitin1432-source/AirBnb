const express = require("express");
const app = express();
const users = require("./routes/users.js");
const posts = require("./routes/posts.js");
const session = require("express-session");   
const flash = require("connect-flash");
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOptions = {
    secret : "mysecret" ,
    resave : false,
    saveUninitialized : true,
};

app.use(session(sessionOptions));
app.use(flash());

app.get("/register" , (req , res) => {
    let {name  = "Guest"} = req.query;
   req.session.name = name;
 if(name == "Guest") {
       req.flash("success", "Welcome to our website, Guest!");
   } else {
       req.flash("success", `Welcome to our website, ${name}!`);
   }
});
app.get("/hello"  , (req ,res) =>{ res.locals.message = req.flash("success");
   res.render.message = req.flash("success");
   res.render("page.ejs", {name: req.session.name});
   
});

// app.get("/reqcount" , (req ,res ) => {
//     if(req.session.count) {
//         req.session.count++;
//     } else {
//         req.session.count = 1;
//     }
//     res.send(`you sent request x ${req.session.count} times`)
// })

// app.get("/test" , (req, res) => {
//     res.send("successfully tested");
// });

app.listen(3000 , () => {
    console.log("server is listening on port 3000");
})