const MachineForm = require("../model/machineForm.model");
const { Machine } = require("../model/machine.model");
const response = require("../helper/response");

// Create new form submission
exports.createForm = async (req, res) => {
  try {
    const {
      machine,
      customer,
      fieldValues,
      customFieldValues,
      notes,
      // Pricing Details
      totalPrice,
      addons,
      gstPercentage,
      gstAmount,
      discount,
      finalTotal,
      // Business Details
      advance,
      cancellation,
      delivery,
      insurance,
      warranty,
      validity,
    } = req.body;
    console.log(req.body);
    // Validate machine exists
    const machineExists = await Machine.findOne({ _id: machine });
    if (!machineExists) {
      return res.status(404).json(response(false, "Machine not found"));
    }

    // Validate all required fields are filled
    const machineFields = machineExists.fields.filter(
      (field) => field.isRequired
    );
    const missingFields = machineFields.filter((field) => {
      return !fieldValues.some(
        (fv) => fv.fieldId.toString() === field._id.toString()
      );
    });

    if (missingFields.length > 0) {
      return res.status(400).json(
        response(false, "Missing required fields", {
          missingFields: missingFields.map((field) => field.title),
        })
      );
    }

    const form = new MachineForm({
      machine,
      customer,
      submittedBy: req.user._id,
      fieldValues,
      customFieldValues,
      notes,
      // Pricing Details
      totalPrice,
      addons,
      gstPercentage,
      gstAmount,
      discount,
      finalTotal,
      // Business Details
      advance,
      cancellation,
      delivery,
      insurance,
      warranty,
      validity,
      status: "draft",
    });

    await form.save();
    res.status(201).json(response(true, "Form created successfully", form));
  } catch (error) {
    console.log(error);
    res.status(500).json(response(false, error.message));
  }
};

// Get all form submissions
exports.getAllForms = async (req, res) => {
  try {
    const forms = await MachineForm.find()
      .populate("machine")
      .populate("customer")
      .populate("submittedBy")
      .sort({ createdAt: -1 });

    res.status(200).json(response(true, "Forms retrieved successfully", forms));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Get form by ID
exports.getFormById = async (req, res) => {
  try {
    const form = await MachineForm.findById(req.params.id)
      .populate("machine")
      .populate("customer")
      .populate("submittedBy", "username");

    if (!form) {
      return res.status(404).json(response(false, "Form not found"));
    }

    res.status(200).json(response(true, "Form retrieved successfully", form));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Update form
exports.updateForm = async (req, res) => {
  try {
    const {
      machine,
      customer,
      fieldValues,
      customFieldValues,
      notes,
      // Pricing Details
      totalPrice,
      addons,
      gstPercentage,
      gstAmount,
      discount,
      finalTotal,
      // Business Details
      advance,
      cancellation,
      delivery,
      insurance,
      warranty,
      validity,
      bankDetails,
    } = req.body;

    const form = await MachineForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json(response(false, "Form not found"));
    }

    // Update basic fields
    form.machine = machine;
    form.customer = customer;
    form.fieldValues = fieldValues;
    form.customFieldValues = customFieldValues;
    form.notes = notes;

    // Update pricing details
    form.totalPrice = totalPrice;
    form.addons = addons;
    form.gstPercentage = gstPercentage;
    form.gstAmount = gstAmount;
    form.discount = discount;
    form.finalTotal = finalTotal;

    // Update business details
    form.advance = advance;
    form.cancellation = cancellation;
    form.delivery = delivery;
    form.insurance = insurance;
    form.warranty = warranty;
    form.validity = validity;
    form.bankDetails = bankDetails;

    await form.save();
    res.status(200).json(response(true, "Form updated successfully", form));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Submit form
exports.submitForm = async (req, res) => {
  try {
    const form = await MachineForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json(response(false, "Form not found"));
    }

    if (form.status !== "draft") {
      return res.status(400).json(response(false, "Form is already submitted"));
    }

    form.status = "submitted";
    await form.save();

    res.status(200).json(response(true, "Form submitted successfully", form));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Update form status (approve/reject)
exports.updateFormStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const form = await MachineForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json(response(false, "Form not found"));
    }

    if (form.status !== "submitted") {
      return res
        .status(400)
        .json(response(false, "Form must be submitted first"));
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json(response(false, "Invalid status"));
    }

    form.status = status;
    await form.save();

    res.status(200).json(response(true, `Form ${status} successfully`, form));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Delete form
exports.deleteForm = async (req, res) => {
  try {
    const form = await MachineForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json(response(false, "Form not found"));
    }

    // Only allow deletion if form is in draft status
    if (form.status !== "draft") {
      return res
        .status(400)
        .json(response(false, "Cannot delete submitted form"));
    }

    await MachineForm.findByIdAndDelete(req.params.id);
    res.status(200).json(response(true, "Form deleted successfully"));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};
