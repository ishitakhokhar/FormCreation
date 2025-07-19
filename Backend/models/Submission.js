const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      answer: {
        type: mongoose.Schema.Types.Mixed, // Allows for text, arrays (for checkboxes), etc.
        required: true,
      },
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Submission", SubmissionSchema);
