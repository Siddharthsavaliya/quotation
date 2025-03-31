const Quotation = require("../model/quotation.model");
const Customer = require("../model/customer.model");
const response = require("../helper/response");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

// Create new quotation
exports.createQuotation = async (req, res) => {
  try {
    const quotation = new Quotation({
      ...req.body,
      createdBy: req.user._id,
    });
    await quotation.save();
    res
      .status(201)
      .json(response(true, "Quotation created successfully", quotation));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Get all quotations
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate("createdBy", "username")
      .populate("customer", "fullName companyName");
    res
      .status(200)
      .json(response(true, "Quotations retrieved successfully", quotations));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Get single quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("createdBy", "username")
      .populate(
        "customer",
        "fullName companyName email phone companyName gst pan address city state pincode"
      );

    if (!quotation) {
      return res.status(404).json(response(false, "Quotation not found"));
    }

    res
      .status(200)
      .json(response(true, "Quotation retrieved successfully", quotation));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Update quotation
exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quotation) {
      return res.status(404).json(response(false, "Quotation not found"));
    }

    res
      .status(200)
      .json(response(true, "Quotation updated successfully", quotation));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Delete quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);

    if (!quotation) {
      return res.status(404).json(response(false, "Quotation not found"));
    }

    res.status(200).json(response(true, "Quotation deleted successfully"));
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};

// Generate PDF
exports.generatePDF = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("createdBy", "username")
      .populate(
        "customer",
        "fullName companyName email phone companyName gst pan address city state pincode"
      );

    if (!quotation) {
      return res.status(404).json(response(false, "Quotation not found"));
    }

    // Read the EJS template
    const templatePath = path.join(__dirname, "../views/quotation.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");

    // Render the template with quotation data
    const html = ejs.render(template, { quotation });

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=quotation-${quotation.quotationNumber}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text("Quotation", { align: "center" });

    // Add company header
    doc.moveDown();
    doc.fontSize(12).text("Your Company Name", { align: "center" });
    doc.fontSize(10).text("Your Company Address", { align: "center" });
    doc.moveDown();

    // Add quotation details
    doc.fontSize(12).text(`Quotation Number: ${quotation.quotationNumber}`);
    doc.text(`Date: ${quotation.createdAt.toLocaleDateString()}`);
    doc.moveDown();

    // Add customer details
    doc.fontSize(12).text("Customer Details:");
    doc.fontSize(10).text(`Name: ${quotation.customer.fullName}`);
    doc.text(`Company: ${quotation.customer.companyName}`);
    doc.text(`Address: ${quotation.customer.address}`);
    doc.text(`GST: ${quotation.customer.gst}`);
    doc.moveDown();

    // Add machine details
    doc.fontSize(12).text(`Machine: ${quotation.machine}`);
    doc.moveDown();

    // Add sections
    const sections = [
      { title: "BARREL", data: quotation.barrel },
      { title: "SCREW", data: quotation.screw },
      { title: "DRIVE", data: quotation.drive },
      { title: "DIE", data: quotation.die },
      { title: "COOLING RING", data: quotation.coolingRing },
      { title: "TAKE OFF", data: quotation.takeOff },
      { title: "WINDER", data: quotation.winder },
      { title: "CONTROL PANEL", data: quotation.controlPanel },
    ];

    sections.forEach((section) => {
      doc.fontSize(12).text(section.title);
      doc.fontSize(10);
      Object.entries(section.data).forEach(([key, value]) => {
        if (key !== "additionalFields") {
          doc.text(`${key}: ${value}`);
        }
      });
      if (section.data.additionalFields?.length > 0) {
        section.data.additionalFields.forEach((field) => {
          doc.text(`${field.title}: ${field.description}`);
        });
      }
      doc.moveDown();
    });

    // Add price section
    doc.fontSize(12).text("PRICE DETAILS");
    doc.fontSize(10);
    Object.entries(quotation.price).forEach(([key, value]) => {
      if (key !== "additionalFields") {
        doc.text(`${key}: ${value}`);
      }
    });
    if (quotation.price.additionalFields?.length > 0) {
      quotation.price.additionalFields.forEach((field) => {
        doc.text(`${field.title}: ${field.description}`);
      });
    }
    doc.moveDown();

    // Add footer
    doc.fontSize(10).text("Terms and Conditions:", { underline: true });
    doc.text("1. This quotation is valid for 30 days from the date of issue.");
    doc.text("2. Payment terms: 50% advance, 50% before delivery.");
    doc.text("3. Delivery time: 4-6 weeks from order confirmation.");
    doc.moveDown();

    // Add signature
    doc.text("For Your Company Name", { align: "right" });
    doc.text("Authorized Signatory", { align: "right" });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    res.status(500).json(response(false, error.message));
  }
};
