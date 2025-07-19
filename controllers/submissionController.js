const Form = require("../models/Form");
const Submission = require("../models/Submission");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const path = require("path");

// @desc    Submit a form
// @route   POST /api/submissions/:formId
// @access  Public
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
