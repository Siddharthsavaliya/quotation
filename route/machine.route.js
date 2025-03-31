const express = require("express");
const router = express.Router();
const machineController = require("../controller/machine.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

// Get field types and value types
router.get("/field-types", machineController.getFieldTypes);

// Create new machine
router.post("/", machineController.createMachine);

// Get all machines
router.get("/", machineController.getAllMachines);

// Get single machine by ID
router.get("/:id", machineController.getMachineById);

// Update machine
router.put("/:id", machineController.updateMachine);

// Delete machine
router.delete("/:id", machineController.deleteMachine);

// Add custom field to machine
router.post("/:id/custom-fields", machineController.addCustomField);

// Update custom field value
router.put(
  "/:machineId/custom-fields/:fieldId",
  machineController.updateCustomFieldValue
);

module.exports = router;
