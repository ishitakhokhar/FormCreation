const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ["text", "radio", "checkbox", "dropdown"],
    required: true,
  },
  options: [{ type: String }],
  isRequired: { type: Boolean, default: false },
  conditionalLogic: {
    show: { type: Boolean, default: true },
    dependentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    dependentOption: { type: String },
  },
});

const FormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questions: [QuestionSchema],
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Submission" }],
});

module.exports = mongoose.model("Form", FormSchema);
