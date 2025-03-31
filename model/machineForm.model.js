const mongoose = require("mongoose");

// Schema for field values
const fieldValueSchema = new mongoose.Schema({
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  section: {
    type: Number,
    required: true,
  },
});

// Schema for custom field values
const customFieldValueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  section: {
    type: Number,
    required: true,
  },
  order: { type: Number, default: 0 },
});

const machineFormSchema = new mongoose.Schema(
  {
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fieldValues: [fieldValueSchema],
    customFieldValues: [customFieldValueSchema],
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Generate form number before saving
machineFormSchema.pre("save", async function (next) {
  if (!this.formNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const count = await this.constructor.countDocuments();
    this.formNumber = `MF${year}${month}${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

const MachineForm = mongoose.model("MachineForm", machineFormSchema);

module.exports = MachineForm;
