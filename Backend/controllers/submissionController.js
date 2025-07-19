const Form = require("../models/Form");
const Submission = require("../models/Submission");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const path = require("path");

// @desc    Submit a form
// @route   POST /api/submissions/:formId
// @access  Public
exports.exportSubmissionsToCsv = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId).populate("questions");
    const submissions = await Submission.find({ form: req.params.formId });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const exportsDir = path.join(__dirname, "..", "exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    const filePath = path.join(exportsDir, `${form.name}_submissions.csv`);

    // ** FIX STARTS HERE **
    // 1. Create the CSV header dynamically from the form's questions.
    // Each question's text becomes a column header, and its ID is the key.
    const header = form.questions.map((q) => ({
      id: q._id.toString(), // Use the question ID as the key
      title: q.questionText, // Use the question text as the column title
    }));

    // Add a column for the submission date for extra detail
    header.unshift({ id: "submittedAt", title: "Submission Date" });

    const csvWriter = createCsvWriter({
      path: filePath,
      header: header,
    });

    // 2. Map each submission to a record object.
    // The keys of the record object must match the 'id' fields in the header.
    const records = submissions.map((sub) => {
      const record = {
        submittedAt: sub.submittedAt.toISOString().split("T")[0], // Format date nicely
      };

      // For each answer in the submission, add it to the record
      // using the question's ID as the key.
      sub.answers.forEach((ans) => {
        const questionId = ans.questionId.toString();
        // Handle different answer types (text vs. array for checkboxes)
        record[questionId] = Array.isArray(ans.answer)
          ? ans.answer.join(", ")
          : ans.answer;
      });
      return record;
    });
    // ** FIX ENDS HERE **

    await csvWriter.writeRecords(records);

    // Allow the browser to download the file
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
      }
      // Optional: Delete the file from the server after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("CSV Export Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
exports.submitForm = async (req, res) => {
  const { formId } = req.params;
  const { answers } = req.body;

  try {
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const submission = new Submission({
      form: formId,
      answers,
    });

    const createdSubmission = await submission.save();
    form.submissions.push(createdSubmission._id);
    await form.save();

    res.status(201).json(createdSubmission);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all submissions for a form
// @route   GET /api/submissions/:formId
// @access  Private
exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      form: req.params.formId,
    }).populate("answers.questionId");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Export submissions to CSV
// @route   GET /api/submissions/:formId/export/csv
// @access  Private
exports.exportSubmissionsToCsv = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId).populate("questions");
    const submissions = await Submission.find({ form: req.params.formId });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const filePath = path.join(
      __dirname,
      "..",
      "exports",
      `${form.name}_submissions.csv`
    );
    if (!fs.existsSync(path.join(__dirname, "..", "exports"))) {
      fs.mkdirSync(path.join(__dirname, "..", "exports"));
    }

    const header = form.questions.map((q) => ({
      id: q._id.toString(),
      title: q.questionText,
    }));

    const csvWriter = createCsvWriter({
      path: filePath,
      header: [{ id: "submissionId", title: "Submission ID" }, ...header],
    });

    const records = submissions.map((sub) => {
      const record = { submissionId: sub._id.toString() };
      sub.answers.forEach((ans) => {
        record[ans.questionId.toString()] = ans.answer;
      });
      return record;
    });

    await csvWriter.writeRecords(records);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
