const express = require("express");
const router = express.Router();

router.get("/posts" , (req ,res) => {
    res.send("GET for  posts");
});
// show route  
router.get("/posts/:id" , (req ,res) => {
    res.send("GET for show posts");
});
// POST route
router.post("/posts" , (req ,res) => {
    res.send("POST for create posts");

});
// delete route 
router.delete("/posts/:id" , (req ,res) => {
    res.send("delete for posts");

});

module.exports = router;

