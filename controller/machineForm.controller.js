const MachineForm = require("../model/machineForm.model");
const { Machine } = require("../model/machine.model");
const response = require("../helper/response");

// Create new form submission
exports.createForm = async (req, res) => {
  try {
    const {
      customer,
      machines,
      otherCharges,
      notes,
      // Business Details
      advance,
      cancellation,
      delivery,
      insurance,
      warranty,
      validity,
    } = req.body;
    console.log(req.body);
    // Validate all machines exist and required fields are filled
    for (const machineItem of machines) {
      const machineExists = await Machine.findOne({ _id: machineItem.machine });
      if (!machineExists) {
        return res
          .status(404)
          .json(response(false, `Machine ${machineItem.machine} not found`));
      }

      // Validate all required fields are filled for each machine
      const machineFields = machineExists.fields.filter(
        (field) => field.isRequired
      );
      const missingFields = machineFields.filter((field) => {
        return !machineItem.fieldValues.some(
          (fv) => fv.fieldId.toString() === field._id.toString()
        );
      });

      if (missingFields.length > 0) {
        return res.status(400).json(
          response(
            false,
            `Missing required fields for machine ${machineExists.name}`,
            {
              missingFields: missingFields.map((field) => field.title),
            }
          )
        );
      }
    }

    // Calculate overall totals (excluding other charges)
    const totalPrice = machines.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalGstAmount = machines.reduce(
      (sum, item) => sum + item.gstAmount,
      0
    );
    const totalDiscount = machines.reduce(
      (sum, item) => sum + (item.discount || 0),
      0
    );
    const finalTotal = machines.reduce((sum, item) => sum + item.finalTotal, 0);

    // Calculate other charges totals (separate from main total)
    let otherChargesSubtotal = 0;
    let otherChargesGST = 0;
    let otherChargesGrandTotal = 0;

    if (otherCharges && otherCharges.length > 0) {
      otherChargesSubtotal = otherCharges.reduce((sum, charge) => sum + charge.amount, 0);
      otherChargesGST = Math.round(otherChargesSubtotal * 0.18); // 18% GST
      otherChargesGrandTotal = otherChargesSubtotal + otherChargesGST;
    }

    const form = new MachineForm({
      customer,
      submittedBy: req.user._id,
      machines,
      otherCharges,
      otherChargesSubtotal,
      otherChargesGST,
      otherChargesGrandTotal,
      notes,
      // Overall pricing details
      totalPrice,
      totalGstAmount,
      totalDiscount,
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
    res.status(500).json(response(false, error.message));
  }
};

// Get all form submissions
exports.getAllForms = async (req, res) => {
  try {
    const forms = await MachineForm.find()
      .populate({
        path: "machines.machine",
        model: "Machine",
      })
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
      .populate({
        path: "machines.machine",
        model: "Machine",
      })
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
      customer,
      machines,
      otherCharges,
      notes,
      // Business Details
      advance,
      cancellation,
      delivery,
      insurance,
      warranty,
      validity,
    } = req.body;

    const form = await MachineForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json(response(false, "Form not found"));
    }

    // Validate all machines exist and required fields are filled
    for (const machineItem of machines) {
      const machineExists = await Machine.findOne({ _id: machineItem.machine });
      if (!machineExists) {
        return res
          .status(404)
          .json(response(false, `Machine ${machineItem.machine} not found`));
      }

      // Validate all required fields are filled for each machine
      const machineFields = machineExists.fields.filter(
        (field) => field.isRequired
      );
      const missingFields = machineFields.filter((field) => {
        return !machineItem.fieldValues.some(
          (fv) => fv.fieldId.toString() === field._id.toString()
        );
      });

      if (missingFields.length > 0) {
        return res.status(400).json(
          response(
            false,
            `Missing required fields for machine ${machineExists.name}`,
            {
              missingFields: missingFields.map((field) => field.title),
            }
          )
        );
      }
    }

    // Calculate overall totals (excluding other charges)
    const totalPrice = machines.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalGstAmount = machines.reduce(
      (sum, item) => sum + item.gstAmount,
      0
    );
    const totalDiscount = machines.reduce(
      (sum, item) => sum + (item.discount || 0),
      0
    );
    const finalTotal = machines.reduce((sum, item) => sum + item.finalTotal, 0);

    // Calculate other charges totals (separate from main total)
    let otherChargesSubtotal = 0;
    let otherChargesGST = 0;
    let otherChargesGrandTotal = 0;

    if (otherCharges && otherCharges.length > 0) {
      otherChargesSubtotal = otherCharges.reduce((sum, charge) => sum + charge.amount, 0);
      otherChargesGST = Math.round(otherChargesSubtotal * 0.18); // 18% GST
      otherChargesGrandTotal = otherChargesSubtotal + otherChargesGST;
    }

    // Update form fields
    form.customer = customer;
    form.machines = machines;
    form.otherCharges = otherCharges || [];
    form.otherChargesSubtotal = otherChargesSubtotal;
    form.otherChargesGST = otherChargesGST;
    form.otherChargesGrandTotal = otherChargesGrandTotal;
    form.notes = notes;
    form.totalPrice = totalPrice;
    form.totalGstAmount = totalGstAmount;
    form.totalDiscount = totalDiscount;
    form.finalTotal = finalTotal;
    form.advance = advance;
    form.cancellation = cancellation;
    form.delivery = delivery;
    form.insurance = insurance;
    form.warranty = warranty;
    form.validity = validity;

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

// Update other charges
exports.updateOtherCharges = async (req, res) => {
  try {
    const { otherCharges } = req.body;
    const form = await MachineForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json(response(false, "Form not found"));
    }

    // Only allow updates if form is in draft status
    if (form.status !== "draft") {
      return res
        .status(400)
        .json(response(false, "Cannot update submitted form"));
    }

    // Calculate other charges totals
    let otherChargesSubtotal = 0;
    let otherChargesGST = 0;
    let otherChargesGrandTotal = 0;

    if (otherCharges && otherCharges.length > 0) {
      otherChargesSubtotal = otherCharges.reduce((sum, charge) => sum + charge.amount, 0);
      otherChargesGST = Math.round(otherChargesSubtotal * 0.18); // 18% GST
      otherChargesGrandTotal = otherChargesSubtotal + otherChargesGST;
    }

    // Update form fields
    form.otherCharges = otherCharges || [];
    form.otherChargesSubtotal = otherChargesSubtotal;
    form.otherChargesGST = otherChargesGST;
    form.otherChargesGrandTotal = otherChargesGrandTotal;

    await form.save();
    res.status(200).json(response(true, "Other charges updated successfully", form));
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
