// for postman
const fs = require("fs");

// Path to your PDF
const filePath = "C:\\Users\\HOE\\Downloads\\functionalsample.pdf";

// Read file as buffer
const pdfBuffer = fs.readFileSync(filePath);

// Convert to base64
const pdfBase64 = pdfBuffer.toString("base64");

console.log(pdfBase64);  // Copy this string
