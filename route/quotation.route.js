const express = require("express");
const router = express.Router();
const quotationController = require("../controller/quotation.controller");
const { protect } = require("../middleware/auth.middleware");

// router.use(protect);
// Create new quotation
router.post("/", quotationController.createQuotation);

// Get all quotations
router.get("/", quotationController.getAllQuotations);

// Get single quotation by ID
router.get("/:id", quotationController.getQuotationById);

// Update quotation
router.put("/:id", quotationController.updateQuotation);

// Delete quotation
router.delete("/:id", quotationController.deleteQuotation);

// Generate PDF
router.get("/:id/pdf", quotationController.generatePDF);

// Generate and download PDF quotation
router.get("/download/:formId", quotationController.generateQuotationPDF);

module.exports = router;
