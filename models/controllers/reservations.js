const Reservation = require("../models/reservation");
const Listing = require("../models/listing");

module.exports.getAvailability = async (req, res) => {
  const { id } = req.params;
  const reservations = await Reservation.find({ listing: id }).select(
    "startDate endDate"
  );
  const ranges = reservations.map((r) => ({
    start: r.startDate,
    end: r.endDate,
  }));
  res.json({ ranges });
};

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

module.exports.createReservation = async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, guests } = req.body;
  const listing = await Listing.findById(id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!(start instanceof Date) || !(end instanceof Date) || isNaN(start) || isNaN(end) || end <= start) {
    return res.status(400).json({ error: "Invalid dates" });
  }
  const guestsNum = Number(guests || 1);
  if (!Number.isInteger(guestsNum) || guestsNum < 1) {
    return res.status(400).json({ error: "Invalid guests" });
  }
  const existing = await Reservation.find({ listing: id });
  const hasOverlap = existing.some((r) => overlaps(start, end, r.startDate, r.endDate));
  if (hasOverlap) return res.status(409).json({ error: "Dates not available" });
  const ms = end - start;
  const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  const totalPrice = nights * (listing.price || 0);
  const reservation = await Reservation.create({
    listing: id,
    guest: req.user._id,
    guests: guestsNum,
    startDate: start,
    endDate: end,
    totalPrice,
  });
  req.flash("success", "Your reservation has been created!");
  res.redirect(`/listings/${id}`);
};
