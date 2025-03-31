const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const quotationSchema = new mongoose.Schema(
  {
    // References to User and Customer
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    machine: {
      type: String,
      required: true,
    },
    // Section 1: BARREL
    barrel: {
      treatment: { type: String, required: true },
      heatingZone: { type: String, required: true },
      heatingLoad: { type: String, required: true },
      additionalFields: [fieldSchema],
    },
    // Section 2: SCREW
    screw: {
      diameter: { type: String, required: true },
      ldRatio: { type: String, required: true },
      treatment: { type: String, required: true },
      capacity: { type: String, required: true },
      additionalFields: [fieldSchema],
    },
    // Section 3: DRIVE
    drive: {
      gearBox: { type: String, required: true },
      pulley: { type: String, required: true },
      additionalFields: [fieldSchema],
    },
    // Section 4: DIE
    die: {
      stationaryDie: { type: String, required: true },
      heatingZone: { type: String, required: true },
      heatingLoad: { type: String, required: true },
      candleFilter: { type: String, required: true },
      additionalFields: [fieldSchema],
    },
    // Section 5: COOLING RING
    coolingRing: {
      blower: { type: String, required: true },
      additionalFields: [fieldSchema],
    },
    // Section 6: TAKE OFF (Tower)
    takeOff: {
      irisRing: { type: String, required: true },
      nipRolls: { type: String, required: true },
      drive: { type: String, required: true },
      speed: { type: String, required: true },
      flatteningBoard: { type: String, required: true },
      additionalFields: [fieldSchema],
    },
    // Section 7: WINDER
    winder: {
      drive: { type: String, required: true },
      additionalFields: [fieldSchema],
    },
    // Section 8: CONTROL PANEL
    controlPanel: {
      temperature: { type: String, required: true },
      otherStarters: { type: String, required: true },
      additionalFields: [fieldSchema],
    },
    // Section 9: PRICE
    price: {
      gstTax: { type: Number, required: true },
      advance: { type: String, required: true },
      cancellation: { type: String, required: true },
      delivery: { type: String, required: true },
      insurance: { type: String, required: true },
      warranty: { type: String, required: true },
      validity: { type: String, required: true },
      bankDetails: { type: String, required: true },
      additionalFields: [fieldSchema],
    },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected"],
      default: "draft",
    },
    quotationNumber: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate quotation number before saving
quotationSchema.pre("save", async function (next) {
  if (!this.quotationNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const count = await this.constructor.countDocuments();
    this.quotationNumber = `QT${year}${month}${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

const Quotation = mongoose.model("Quotation", quotationSchema);

module.exports = Quotation;
