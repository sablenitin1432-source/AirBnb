
const express = require("express");
const router = express.Router();

// users routes

// index route
router.get("/users" , (req ,res) => {
    res.send("GET for  users");
});
// show route  
router.get("/users/:id" , (req ,res) => {
    res.send("GET for show users id");
});
// POST route
router.post("/users" , (req ,res) => {
    res.send("POST for create users");

});
// delete route 
router.delete("/users/:id" , (req ,res) => {
    res.send("delete for  users");

});

module.exports = router;