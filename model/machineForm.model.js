const mongoose = require("mongoose");

// Schema for addons
const addonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

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
    formNumber: {
      type: String,
      unique: true,
    },
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
    // Pricing Details
    totalPrice: {
      type: Number,
      required: true,
    },
    addons: [addonSchema],
    gstPercentage: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalTotal: {
      type: Number,
      required: true,
    },
    // Business Details
    advance: {
      type: String,
      required: true,
    },
    cancellation: {
      type: String,
      required: true,
    },
    delivery: {
      type: String,
      required: true,
    },
    insurance: {
      type: String,
      required: true,
    },
    warranty: {
      type: String,
      required: true,
    },
    validity: {
      type: String,
      required: true,
    },
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
    try {
      // Find the last form number
      const lastForm = await this.constructor.findOne(
        {},
        {},
        { sort: { formNumber: -1 } }
      );

      let nextNumber = 1;
      if (lastForm && lastForm.formNumber) {
        // Extract the number from the last form number (e.g., "QUO-123" -> 123)
        const lastNumber = parseInt(lastForm.formNumber.split("-")[1]);
        nextNumber = lastNumber + 1;
      }

      // Generate new form number
      this.formNumber = `QUO-${nextNumber}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const MachineForm = mongoose.model("MachineForm", machineFormSchema);

module.exports = MachineForm;
