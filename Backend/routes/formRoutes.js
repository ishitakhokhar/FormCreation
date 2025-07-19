const express = require("express");
const router = express.Router();
const {
  createForm,
  getForms,
  getFormById,
  addQuestionToForm,
  updateForm,
  deleteForm
} = require("../controllers/formController");
const { protect,admin } = require("../middlewares/authMiddleware");

router.route("/").post(protect, createForm).get(protect, getForms);
router.route("/:id").get(getFormById);
router.route("/:id/questions").post(protect, addQuestionToForm);
router.route("/:id") .put(protect, updateForm)   // <--- NEW: Update a form (requires authentication and admin role, or form creator role check in controller)
router.route("/:id").delete(protect, deleteForm);
module.exports = router;
