// In backend/models/Form.js

const mongoose = require("mongoose");
// Define a schema for a single visibility rule
const visibilityRuleSchema = new mongoose.Schema({
  // The ID of the field that this rule depends on (e.g., 'designationFieldId')
  fieldId: {
    type: String,
    required: true
  },
  // The operator to compare values (e.g., 'equals', 'notEquals', 'greaterThan')
  operator: {
    type: String,
    enum: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'contains'], // Extend as needed
    required: true
  },
  // The value to compare against
  value: {
    type: mongoose.Schema.Types.Mixed, // Can be string, number, boolean, etc.
    required: true
  }
}, { _id: false }); // No _id for sub-documents if not strictly necessary

// Define a schema for a form question
const questionSchema = new mongoose.Schema({
  // Unique ID for the question within the form (e.g., 'q_designation', 'q_teamSize')
  // This is crucial for linking rules
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'number', 'select', 'radio', 'checkbox', 'date', 'email'], // Add more types as needed
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    type: String
  }], // For 'select', 'radio', 'checkbox' types
  placeholder: {
    type: String
  },
  // NEW: Optional visibility rule for this question
  visibilityRule: {
    type: visibilityRuleSchema,
    required: false // Not all questions will have a rule
  }
});
const QuestionSchema = new mongoose.Schema({
  // Unique ID for the question within the form (e.g., 'q_designation', 'q_teamSize')
  // This is crucial for linking rules
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'number', 'select', 'radio', 'checkbox', 'date', 'email'], // Add more types as needed
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    type: String
  }], // For 'select', 'radio', 'checkbox' types
  placeholder: {
    type: String
  },
  // NEW: Optional visibility rule for this question
  visibilityRule: {
    type: visibilityRuleSchema,
    required: false // Not all questions will have a rule
  }
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
