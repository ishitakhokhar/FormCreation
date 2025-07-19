const Form = require("../models/Form");

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
exports.createForm = async (req, res) => {
  const { name, description } = req.body;

  try {
    const form = new Form({
      name,
      description,
      createdBy: req.user._id,
      questions: [],
    });

    const createdForm = await form.save();
    res.status(201).json(createdForm);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all forms for a user
// @route   GET /api/forms
// @access  Private
exports.getForms = async (req, res) => {
  try {
    const forms = await Form.find({ createdBy: req.user._id });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get a single form by ID
// @route   GET /api/forms/:id
// @access  Public
exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (form) {
      res.json(form);
    } else {
      res.status(404).json({ message: "Form not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Add a question to a form
// @route   POST /api/forms/:id/questions
// @access  Private
// In backend/controllers/formController.js

exports.addQuestionToForm = async (req, res) => {
  const { questionText, questionType, options, isRequired, conditionalLogic } =
    req.body;

  try {
    const form = await Form.findById(req.params.id);

    if (form) {
      const newQuestion = {
        questionText,
        questionType,
        options: questionType === "text" ? [] : options,
        isRequired,
        conditionalLogic,
      };

      // ** FIX STARTS HERE **
      // If conditional logic is enabled but no dependent question is selected,
      // its value is an empty string which causes a database error.
      // We change it to null to prevent the crash.
      if (
        newQuestion.conditionalLogic &&
        !newQuestion.conditionalLogic.dependentQuestion
      ) {
        newQuestion.conditionalLogic.dependentQuestion = null;
      }
      // ** FIX ENDS HERE **

      form.questions.push(newQuestion);
      await form.save();
      res.status(201).json(form);
    } else {
      res.status(404).json({ message: "Form not found" });
    }
  } catch (error) {
    // Also, it's good practice to log the actual error on the server
    console.error("ERROR SAVING QUESTION:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.updateForm = async (req, res) => {
  const { name, description, questions } = req.body; // Frontend sends updated name, description, and the FULL questions array

  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Optional: Authorization check - only the form creator or an admin can update
    // Assuming req.user is populated by your 'protect' middleware
    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this form' });
    }

    form.name = name !== undefined ? name : form.name; // Only update if provided
    form.description = description !== undefined ? description : form.description; // Only update if provided

    // Update the entire questions array. Mongoose handles sub-document validation.
    if (questions !== undefined) {
        // Basic validation: ensure it's an array
        if (!Array.isArray(questions)) {
            return res.status(400).json({ message: 'Questions must be an array.' });
        }
        form.questions = questions;
    }


    const updatedForm = await form.save();
    res.json({ message: 'Form updated successfully', form: updatedForm });

  } catch (error) {
    console.error('Error updating form:', error);
    // Mongoose validation errors often have `error.errors`
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
exports.getFormsCount = async (req, res) => {
    try {
        // Count forms created by the logged-in user
        // This relies on req.user._id being available from your 'protect' middleware.
        const count = await Form.countDocuments({ createdBy: req.user._id });
        res.json({ count });
    } catch (error) {
        // IMPORTANT: Log the actual error for debugging!
        console.error('Error counting forms in getFormsCount:', error);
        res.status(500).json({ message: 'Server Error', error: error.message }); // Send error.message for frontend debugging
    }
};
exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Authorization check
    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this form' });
    }

    await form.deleteOne(); // Use deleteOne() or remove()
    res.json({ message: 'Form removed' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};