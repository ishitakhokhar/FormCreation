const express = require("express");
const router = express.Router();
const {
  submitForm,
  getSubmissions,
  exportSubmissionsToCsv,
} = require("../controllers/submissionController");
const { protect } = require("../middlewares/authMiddleware");

router.route("/:formId").post(submitForm).get(protect, getSubmissions);
router.route("/:formId/export/csv").get(protect, exportSubmissionsToCsv);

module.exports = router;
