const mongoose = require("mongoose");

// Enum for field types
const FIELD_TYPES = {
  DROPDOWN: "dropdown",
  TEXT: "text",
  NUMBER: "number",
  DATE: "date",
  CHECKBOX: "checkbox",
};

// Enum for value types
const VALUE_TYPES = {
  INT: "int",
  STRING: "string",
  FLOAT: "float",
  BOOLEAN: "boolean",
};

// Schema for field options
const fieldOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  amount: { type: Number, default: 0 },
});

// Schema for dynamic fields
const dynamicFieldSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  title: { type: String, required: true },
  isShowUI: { type: Boolean, default: true },
  isEditable: { type: Boolean, default: true },
  type: {
    type: String,
    required: true,
    enum: Object.values(FIELD_TYPES),
  },
  valueType: {
    type: String,
    required: true,
    enum: Object.values(VALUE_TYPES),
  },
  section: {
    type: Number,
    required: true,
    min: 1,
  },
  isDynamic: { type: Boolean, default: false },
  refreshDynamicField: { type: String, default: "first" },
  options: [{
    type: Map,
    of: [fieldOptionSchema],
    default: undefined
  }],
  value: { 
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  isRequired: { type: Boolean, default: false },
  placeholder: String,
  description: String,
  order: { type: Number, default: 0 },
  subOrder: { type: Number, default: 0 },
});

// Schema for custom fields
const customFieldSchema = new mongoose.Schema({
  title: { type: String, required: true },
  section: {
    type: Number,
    required: true,
    min: 1,
  },
  value: { type: mongoose.Schema.Types.Mixed },
  order: { type: Number, default: 0 },
});

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fields: [dynamicFieldSchema],
    customFields: [customFieldSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for hierarchy and name
machineSchema.index({ hierarchy: 1, name: 1 }, { unique: true });

// Pre-save middleware to generate hierarchy if not provided
machineSchema.pre("save", function (next) {
  if (!this.hierarchy) {
    // Generate hierarchy based on parent or create new one
    this.hierarchy = this._id.toString();
  }
  next();
});

const Machine = mongoose.model("Machine", machineSchema);

module.exports = {
  Machine,
  FIELD_TYPES,
  VALUE_TYPES,
};
