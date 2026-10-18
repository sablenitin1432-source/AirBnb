const Vehicle = require("../models/vehicle.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.Map_Token || "";
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const { type, location } = req.query;
    let query = {};

    if (type && type !== 'all') {
        query.vehicleType = type;
    }

    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }

    const vehicles = await Vehicle.find(query).populate("owner");
    res.render("vehicles/index.ejs", { vehicles, query: type || '' });
};

module.exports.showVehicle = async (req, res) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id).populate("owner");

    if (!vehicle) {
        req.flash("error", "Vehicle not found");
        return res.redirect("/vehicles");
    }

    res.render("vehicles/show.ejs", { vehicle, mapBoxToken: process.env.Map_Token });
};

module.exports.renderNewForm = (req, res) => {
    res.render("vehicles/new.ejs");
};

module.exports.createVehicle = async (req, res) => {
    const newVehicle = new Vehicle(req.body.vehicle);
    newVehicle.owner = req.user._id;

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
        let uploadedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        newVehicle.images = uploadedImages;
        newVehicle.image = uploadedImages[0];
    }

    // Geocode with error handling
    try {
        if (mapBoxToken) {
            let response = await geocodingClient.forwardGeocode({
                query: newVehicle.location,
                limit: 1,
            }).send();
            if (response.body.features.length > 0) {
                newVehicle.geometry = response.body.features[0].geometry;
                newVehicle.mapboxPlaceName = response.body.features[0].place_name;
            } else {
                newVehicle.geometry = { type: "Point", coordinates: [77.5946, 12.9716] };
            }
        } else {
            newVehicle.geometry = { type: "Point", coordinates: [77.5946, 12.9716] };
        }
    } catch (err) {
        console.log("\u26a0\ufe0f Vehicle geocoding failed:", err.message);
        newVehicle.geometry = { type: "Point", coordinates: [77.5946, 12.9716] };
    }

    await newVehicle.save();
    req.flash("success", "Vehicle listed successfully!");
    res.redirect("/vehicles");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
        req.flash("error", "Vehicle not found");
        return res.redirect("/vehicles");
    }

    res.render("vehicles/edit.ejs", { vehicle });
};

module.exports.updateVehicle = async (req, res) => {
    const { id } = req.params;

    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
        req.flash("error", "Vehicle not found");
        return res.redirect("/vehicles");
    }

    let vehicleUpdate = { ...req.body.vehicle };
    const prevLocation = (existingVehicle.location || "").trim();
    const nextLocation = (vehicleUpdate.location || "").trim();

    if (nextLocation && nextLocation !== prevLocation) {
        try {
            if (mapBoxToken) {
                let response = await geocodingClient.forwardGeocode({
                    query: nextLocation,
                    limit: 1,
                }).send();
                if (response.body.features.length > 0) {
                    vehicleUpdate.geometry = response.body.features[0].geometry;
                    vehicleUpdate.mapboxPlaceName = response.body.features[0].place_name;
                }
            }
        } catch (err) {
            console.log("\u26a0\ufe0f Vehicle update geocoding failed:", err.message);
        }
    }

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
        let uploadedImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        vehicleUpdate.images = uploadedImages;
        vehicleUpdate.image = uploadedImages[0];
    }

    await Vehicle.findByIdAndUpdate(id, vehicleUpdate);

    req.flash("success", "Vehicle updated successfully!");
    res.redirect(`/vehicles/${id}`);
};

module.exports.deleteVehicle = async (req, res) => {
    const { id } = req.params;
    await Vehicle.findByIdAndDelete(id);
    req.flash("success", "Vehicle deleted successfully!");
    res.redirect("/vehicles");
};
