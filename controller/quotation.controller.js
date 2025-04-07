const Quotation = require("../model/quotation.model");
const Customer = require("../model/customer.model");
const response = require("../helper/response");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
// const puppeteer = require("puppeteer");
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";
const MachineForm = require("../model/machineForm.model");

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

exports.generateQuotationPDF = async (req, res) => {
  try {
    const { formId } = req.params;

    // Find the machine form and populate all necessary fields
    const form = await MachineForm.findById(formId)
      .populate({
        path: "machines.machine",
        model: "Machine",
        populate: {
          path: "fields",
        },
      })
      .populate("customer")
      .populate("submittedBy", "username phone");

    if (!form) {
      return res.status(404).json({
        status: false,
        message: "Form not found",
      });
    }

    // Calculate totals
    const totalPrice = form.machines.reduce(
      (sum, machine) => sum + machine.totalPrice,
      0
    );
    const totalGstAmount = form.machines.reduce(
      (sum, machine) => sum + machine.gstAmount,
      0
    );
    const totalDiscount = form.machines.reduce(
      (sum, machine) => sum + (machine.discount || 0),
      0
    );
    const finalTotal = form.machines.reduce(
      (sum, machine) => sum + machine.finalTotal,
      0
    );

    // Construct terms and conditions from business details
    const terms = `
1. Payment Terms:
   ${form.advance}

2. Cancellation Policy:
   ${form.cancellation}

3. Delivery Terms:
   ${form.delivery}

4. Insurance:
   ${form.insurance}

5. Warranty:
   ${form.warranty}

6. Validity:
   ${form.validity}

${form.notes ? `\nAdditional Notes:\n${form.notes}` : ""}`;

    // Launch puppeteer
    // const browser = await puppeteer.launch({
    //   headless: "new",
    //   args: ["--no-sandbox"],
    // });

    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Read the EJS template
    const templatePath = path.join(__dirname, "../views/quotation.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    console.log(form.machines[0].fieldValues);
    // Render the template with data
    const html = ejs.render(template, {
      formNumber: form.formNumber,
      customer: form.customer,
      machines: form.machines,
      submittedBy: form.submittedBy,
      totalPrice,
      totalGstAmount,
      totalDiscount,
      finalTotal,
      terms,
      advance: form.advance,
      cancellation: form.cancellation,
      delivery: form.delivery,
      insurance: form.insurance,
      warranty: form.warranty,
      validity: form.validity,
      notes: form.notes,
    });

    // Set content
    await page.setContent(html);

    // Generate PDF with proper styling
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        left: "20px",
        right: "20px",
        bottom: "20px",
      },
      preferCSSPageSize: true,
    });

    await browser.close();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=quotation-${form.formNumber}.pdf`
    );

    // Send the PDF
    res.send(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      status: false,
      message: "Error generating PDF",
      error: error.message,
    });
  }
};
