const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// =====================
// ROUTE: GET all listings / CREATE new listing
// =====================
router
  .route("/")
  // Display listings (supports ?category=Rooms etc.)
  .get(
    wrapAsync(async (req, res) => {
      const category = req.query.category || "All";

      let allListings;
      if (category === "All") {
        allListings = await Listing.find({});
      } else {
        allListings = await Listing.find({ category });
      }

      res.render("listings/index", { allListings, category });
    })
  )
  // Create new listing
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// =====================
// ROUTE: Render new listing form
// =====================
router.get("/new", isLoggedIn, listingController.renderNewForm);

// =====================
// ROUTE: Individual listing (SHOW / UPDATE / DELETE)
// =====================
router
  .route("/:id")
  // Show a specific listing
  .get(wrapAsync(listingController.showListing))
  // Update a listing
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  // Delete a listing
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// =====================
// ROUTE: Edit form for a listing
// =====================
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;