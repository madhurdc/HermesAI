import PDFDocument from "pdfkit";

const GOLD = "#D4AF37";
const DARK = "#1a1a1a";
const WHITE = "#ffffff";
const GRAY = "#999999";

/**
 * Normalize non-ASCII characters for standard PDF formatting.
 */
function sanitizeText(text) {
  if (!text) return "";
  return text
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014]/g, "-") // em/en dashes
    .replace(/[\u2026]/g, "...")     // ellipses
    .replace(/[^\x00-\x7F]/g, "");   // strip any other non-ascii chars
}

/**
 * Generate a styled PDF for an interview performance report.
 * Returns a Promise<Buffer>.
 */
export function generateInterviewReportPDF(reportData, domain, difficulty, qaPairs = []) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc
        .rect(0, 0, doc.page.width, 120)
        .fill(DARK);

      doc
        .fontSize(28)
        .fillColor(GOLD)
        .text("HERMES AI", 50, 35, { align: "left" });

      doc
        .fontSize(12)
        .fillColor(WHITE)
        .text("Interview Performance Report", 50, 70);

      doc
        .fontSize(10)
        .fillColor(GRAY)
        .text(`${domain} · ${difficulty} Level · ${new Date().toLocaleDateString()}`, 50, 90);

      doc.moveDown(3);
      let y = 140;

      // Overall Score
      doc
        .fontSize(14)
        .fillColor(DARK)
        .text("Overall Score", 50, y);

      doc
        .fontSize(36)
        .fillColor(GOLD)
        .text(`${reportData.overall_score}/100`, 50, y + 20);

      doc
        .fontSize(12)
        .fillColor(DARK)
        .text(`Mastery Level: ${reportData.mastery_level}`, 250, y + 10);

      doc
        .fontSize(10)
        .fillColor(GRAY)
        .text(sanitizeText(reportData.summary), 250, y + 30, { width: 280 });

      y += 90;
      doc.moveTo(50, y).lineTo(545, y).strokeColor(GRAY).lineWidth(0.5).stroke();
      y += 20;

      // Strengths
      doc.fontSize(13).fillColor(DARK).text("Key Strengths", 50, y);
      y += 20;
      if (reportData.strengths) {
        reportData.strengths.forEach((s) => {
          doc.fontSize(10).fillColor(GRAY).text(`✓  ${sanitizeText(s)}`, 60, y, { width: 480 });
          y += 18;
        });
      }
      y += 10;

      // Improvements
      doc.fontSize(13).fillColor(DARK).text("Areas for Improvement", 50, y);
      y += 20;
      if (reportData.improvements) {
        reportData.improvements.forEach((s) => {
          doc.fontSize(10).fillColor(GRAY).text(`▸  ${sanitizeText(s)}`, 60, y, { width: 480 });
          y += 18;
        });
      }
      y += 10;

      // Question-by-question breakdown
      if (reportData.question_scores && reportData.question_scores.length > 0) {
        doc.moveTo(50, y).lineTo(545, y).strokeColor(GRAY).lineWidth(0.5).stroke();
        y += 15;
        doc.fontSize(13).fillColor(DARK).text("Question-by-Question Breakdown", 50, y);
        y += 20;

        reportData.question_scores.forEach((qs) => {
          if (y > 600) {
            doc.addPage();
            y = 50;
          }
          doc.fontSize(10).fillColor(DARK).text(`Q${qs.question_number}  (Score: ${qs.score}/10)`, 60, y);
          y += 15;
          
          // Render Raw Q&A Pairs
          const rawQA = qaPairs[qs.question_number - 1];
          if (rawQA) {
            const rawQ = `Prompt: ${sanitizeText(rawQA.question)}`;
            const rawA = `Answer: ${sanitizeText(rawQA.answer)}`;
            doc.fontSize(9).fillColor(DARK).text(rawQ, 60, y, { width: 470, oblique: true });
            y += doc.heightOfString(rawQ, { width: 470, oblique: true }) + 3;
            doc.fontSize(9).fillColor(GRAY).text(rawA, 60, y, { width: 470, oblique: true });
            y += doc.heightOfString(rawA, { width: 470, oblique: true }) + 8;
          }

          const fbText = sanitizeText(qs.feedback);
          doc.fontSize(9).fillColor(GRAY).text(fbText, 70, y, { width: 460 });
          y += doc.heightOfString(fbText, { width: 460 }) + 5;

          if (qs.suggestion) {
            const tipText = `Tip: ${sanitizeText(qs.suggestion)}`;
            doc.fontSize(9).fillColor(GOLD).text(tipText, 70, y, { width: 460 });
            y += doc.heightOfString(tipText, { width: 460 }) + 15;
          }
        });
      }

      // Tips
      if (reportData.tips && reportData.tips.length > 0) {
        if (y > 650) {
          doc.addPage();
          y = 50;
        }
        y += 10;
        doc.moveTo(50, y).lineTo(545, y).strokeColor(GRAY).lineWidth(0.5).stroke();
        y += 15;
        doc.fontSize(13).fillColor(DARK).text("Actionable Tips", 50, y);
        y += 20;
        reportData.tips.forEach((tip, i) => {
          doc.fontSize(10).fillColor(GRAY).text(`${i + 1}. ${sanitizeText(tip)}`, 60, y, { width: 480 });
          y += 18;
        });
      }

      // Footer
      doc
        .fontSize(8)
        .fillColor(GRAY)
        .text("Generated by Hermes AI — Know your Path. Know your Purpose.", 50, 770, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate a styled PDF for a resume analysis report.
 * Returns a Promise<Buffer>.
 */
export function generateResumeReportPDF(reportData, filename) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.rect(0, 0, doc.page.width, 120).fill(DARK);

      doc.fontSize(28).fillColor(GOLD).text("HERMES AI", 50, 35);
      doc.fontSize(12).fillColor(WHITE).text("Resume Analysis Report", 50, 70);
      doc.fontSize(10).fillColor(GRAY).text(`File: ${filename} · ${new Date().toLocaleDateString()}`, 50, 90);

      let y = 140;

      // ATS Score
      doc.fontSize(14).fillColor(DARK).text("ATS Compatibility Score", 50, y);
      doc.fontSize(36).fillColor(GOLD).text(`${reportData.ats_score}/100`, 50, y + 20);

      if (reportData.summary) {
        doc.fontSize(10).fillColor(GRAY).text(reportData.summary, 250, y + 10, { width: 280 });
      }

      y += 80;

      // Score Breakdown
      if (reportData.score_breakdown) {
        doc.moveTo(50, y).lineTo(545, y).strokeColor(GRAY).lineWidth(0.5).stroke();
        y += 15;
        doc.fontSize(13).fillColor(DARK).text("Score Breakdown", 50, y);
        y += 20;
        Object.entries(reportData.score_breakdown).forEach(([key, val]) => {
          const label = key.charAt(0).toUpperCase() + key.slice(1);
          doc.fontSize(10).fillColor(GRAY).text(`${label}: ${val}/100`, 60, y);
          y += 16;
        });
        y += 10;
      }

      // Missing Keywords
      if (reportData.missing_keywords?.length) {
        doc.fontSize(13).fillColor(DARK).text("Missing Keywords", 50, y);
        y += 20;
        doc.fontSize(10).fillColor(GRAY).text(reportData.missing_keywords.join(", "), 60, y, { width: 480 });
        y += doc.heightOfString(reportData.missing_keywords.join(", "), { width: 480 }) + 15;
      }

      // Strengths
      if (reportData.strengths?.length) {
        doc.fontSize(13).fillColor(DARK).text("Strengths", 50, y);
        y += 20;
        reportData.strengths.forEach((s) => {
          doc.fontSize(10).fillColor(GRAY).text(`✓  ${s}`, 60, y, { width: 480 });
          y += 18;
        });
        y += 10;
      }

      // Weaknesses
      if (reportData.weaknesses?.length) {
        if (y > 650) { doc.addPage(); y = 50; }
        doc.fontSize(13).fillColor(DARK).text("Weaknesses", 50, y);
        y += 20;
        reportData.weaknesses.forEach((s) => {
          doc.fontSize(10).fillColor(GRAY).text(`▸  ${s}`, 60, y, { width: 480 });
          y += 18;
        });
        y += 10;
      }

      // Suggestions
      if (reportData.suggestions?.length) {
        if (y > 650) { doc.addPage(); y = 50; }
        doc.fontSize(13).fillColor(DARK).text("Improvement Suggestions", 50, y);
        y += 20;
        reportData.suggestions.forEach((s, i) => {
          doc.fontSize(10).fillColor(GRAY).text(`${i + 1}. ${s}`, 60, y, { width: 480 });
          y += 18;
        });
      }

      // Footer
      doc.fontSize(8).fillColor(GRAY)
        .text("Generated by Hermes AI — Know your Path. Know your Potential.", 50, 770, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
