const Dhaba = require("../models/dhaba.js");
const mapBoxToken = process.env.Map_Token || "";

module.exports.index = async (req, res) => {
    const { category, cuisine } = req.query;
    let query = {};

    if (category && category !== 'all') {
        query.category = category;
    }

    if (cuisine) {
        query.cuisine = { $in: [cuisine] };
    }

    const dhabas = await Dhaba.find(query).populate("owner");
    res.render("dhabas/index.ejs", { dhabas, query: category || '' });
};

module.exports.showDhaba = async (req, res) => {
    const { id } = req.params;
    const dhaba = await Dhaba.findById(id).populate("owner");

    if (!dhaba) {
        req.flash("error", "Dhaba not found");
        return res.redirect("/dhabas");
    }

    res.render("dhabas/show.ejs", { dhaba, mapBoxToken: process.env.Map_Token });
};

module.exports.renderNewForm = (req, res) => {
    res.render("dhabas/new.ejs");
};

module.exports.createDhaba = async (req, res) => {
    const newDhaba = new Dhaba(req.body.dhaba);
    newDhaba.owner = req.user._id;

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
        let uploadedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        newDhaba.images = uploadedImages;
        newDhaba.image = uploadedImages[0];
    }

    // Default geometry
    newDhaba.geometry = {
        type: "Point",
        coordinates: [77.5946, 12.9716]
    };

    await newDhaba.save();
    req.flash("success", "Dining spot listed successfully!");
    res.redirect("/dhabas");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const dhaba = await Dhaba.findById(id);

    if (!dhaba) {
        req.flash("error", "Dhaba not found");
        return res.redirect("/dhabas");
    }

    res.render("dhabas/edit.ejs", { dhaba });
};

module.exports.updateDhaba = async (req, res) => {
    const { id } = req.params;
    const dhaba = await Dhaba.findByIdAndUpdate(id, { ...req.body.dhaba });

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
        let uploadedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        dhaba.images = uploadedImages;
        dhaba.image = uploadedImages[0];
        await dhaba.save();
    }

    req.flash("success", "Dining spot updated successfully!");
    res.redirect(`/dhabas/${id}`);
};

module.exports.deleteDhaba = async (req, res) => {
    const { id } = req.params;
    await Dhaba.findByIdAndDelete(id);
    req.flash("success", "Dhaba deleted successfully!");
    res.redirect("/dhabas");
};
