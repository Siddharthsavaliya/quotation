const { Machine, FIELD_TYPES, VALUE_TYPES } = require("../model/machine.model");
const response = require("../helper/response");

// Create new machine
exports.createMachine = async (req, res) => {
  try {
    const fields = req.body.fields?.map(field => {
      if (field.options && Array.isArray(field.options)) {
        // Ensure options is an array of objects { keyName: [ ... ] }
        field.options = field.options.map(optObj => {
          // If already in correct format, return as is
          if (typeof optObj === 'object' && !Array.isArray(optObj) && Object.values(optObj)[0] && Array.isArray(Object.values(optObj)[0])) {
            return optObj;
          }
          // If old format (array of options), wrap in a default key
          return { keyName: Array.isArray(optObj) ? optObj : [optObj] };
        });
      }
      return field;
    });
    const machine = new Machine({
      ...req.body,
      fields,
      createdBy: req.user._id,
    });
    await machine.save();
    res
      .status(201)
      .json(response(true, "Machine created successfully", machine));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Get all machines
exports.getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find()
      .populate("createdBy", "username")
      .sort({ hierarchy: 1, name: 1 });
    res
      .status(200)
      .json(response(true, "Machines retrieved successfully", machines));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Get single machine by ID
exports.getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id).populate(
      "createdBy",
      "username"
    );

    if (!machine) {
      return res.status(404).json(response(false, "Machine not found"));
    }

    res
      .status(200)
      .json(response(true, "Machine retrieved successfully", machine));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Update machine
exports.updateMachine = async (req, res) => {
  try {
    const fields = req.body.fields?.map(field => {
      if (field.options && Array.isArray(field.options)) {
        field.options = field.options.map(optObj => {
          if (typeof optObj === 'object' && !Array.isArray(optObj) && Object.values(optObj)[0] && Array.isArray(Object.values(optObj)[0])) {
            return optObj;
          }
          return { keyName: Array.isArray(optObj) ? optObj : [optObj] };
        });
      }
      return field;
    });
    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { ...req.body, fields },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!machine) {
      return res.status(404).json(response(false, "Machine not found"));
    }

    res
      .status(200)
      .json(response(true, "Machine updated successfully", machine));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Delete machine
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);

    if (!machine) {
      return res.status(404).json(response(false, "Machine not found"));
    }

    res.status(200).json(response(true, "Machine deleted successfully"));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Add custom field to machine
exports.addCustomField = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json(response(false, "Machine not found"));
    }

    machine.customFields.push(req.body);
    await machine.save();

    res
      .status(200)
      .json(response(true, "Custom field added successfully", machine));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Update custom field value
exports.updateCustomFieldValue = async (req, res) => {
  try {
    const { machineId, fieldId } = req.params;
    const { value } = req.body;

    const machine = await Machine.findById(machineId);

    if (!machine) {
      return res.status(404).json(response(false, "Machine not found"));
    }

    const customField = machine.customFields.id(fieldId);
    if (!customField) {
      return res.status(404).json(response(false, "Custom field not found"));
    }

    customField.value = value;
    await machine.save();

    res
      .status(200)
      .json(response(true, "Custom field value updated successfully", machine));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Get field types and value types
exports.getFieldTypes = async (req, res) => {
  try {
    res.status(200).json(
      response(true, "Field types retrieved successfully", {
        fieldTypes: FIELD_TYPES,
        valueTypes: VALUE_TYPES,
      })
    );
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};
