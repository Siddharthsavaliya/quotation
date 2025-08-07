const express = require("express");
const router = express.Router();
const machineFormController = require("../controller/machineForm.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

// Create new form
router.post("/", machineFormController.createForm);

// Get all forms
router.get("/", machineFormController.getAllForms);

// Get form by ID
router.get("/:id", machineFormController.getFormById);

// Update form
router.put("/:id", machineFormController.updateForm);

// Update other charges
router.put("/:id/other-charges", machineFormController.updateOtherCharges);

// Submit form
router.post("/:id/submit", machineFormController.submitForm);

// Update form status (approve/reject)
router.put("/:id/status", machineFormController.updateFormStatus);

// Delete form
router.delete("/:id", machineFormController.deleteForm);

module.exports = router;
