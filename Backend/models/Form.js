// In backend/models/Form.js

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
  // This is the updated section for conditional logic
  conditionalLogic: {
    enabled: { type: Boolean, default: false },
    dependentQuestion: { type: mongoose.Schema.Types.ObjectId },
    condition: { type: String, enum: ["is equal to", "is not equal to"] },
    value: { type: String },
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
