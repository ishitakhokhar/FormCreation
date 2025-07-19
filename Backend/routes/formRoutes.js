const express = require("express");
const router = express.Router();
const {
  createForm,
  getForms,
  getFormById,
  addQuestionToForm,
} = require("../controllers/formController");
const { protect } = require("../middlewares/authMiddleware");

router.route("/").post(protect, createForm).get(protect, getForms);
router.route("/:id").get(getFormById);
router.route("/:id/questions").post(protect, addQuestionToForm);

module.exports = router;
