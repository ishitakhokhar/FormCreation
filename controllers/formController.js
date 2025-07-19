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

      form.questions.push(newQuestion);
      await form.save();
      res.status(201).json(form);
    } else {
      res.status(404).json({ message: "Form not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
