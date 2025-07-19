// In frontend/src/views/examples/FormViewer.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import {
  Card,
  CardBody,
  Container,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

const FormViewer = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchForm = async () => {
      const { data } = await api.get(`/forms/${formId}`);
      setForm(data);
    };
    fetchForm();
  }, [formId]);

  const handleInputChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = {
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
    };
    try {
      await api.post(`/submissions/${formId}`, submissionData);
      alert("Form submitted successfully!");
      // Optional: Clear the form or redirect
    } catch (error) {
      alert("Failed to submit form.");
    }
  };

  // This function checks the conditional logic
  const shouldShowQuestion = (question) => {
    if (!question.conditionalLogic || !question.conditionalLogic.enabled) {
      return true; // Always show if logic is not enabled
    }

    const { dependentQuestion, condition, value } = question.conditionalLogic;
    const dependentAnswer = answers[dependentQuestion];

    if (dependentAnswer === undefined) {
      return false; // Hide if dependent question is not answered
    }

    if (condition === "is equal to") {
      return dependentAnswer === value;
    }
    if (condition === "is not equal to") {
      return dependentAnswer !== value;
    }
    return true;
  };

  if (!form) return <div style={{ padding: "20px" }}>Loading form...</div>;

  return (
    <Container className="mt-5">
      <Card className="shadow">
        <CardBody>
          <h3>{form.name}</h3>
          <p>{form.description}</p>
          <Form onSubmit={handleSubmit}>
            {form.questions.map((q) => {
              if (!shouldShowQuestion(q)) return null; // Hide question based on logic
              return (
                <FormGroup key={q._id} className="mb-3">
                  <Label>
                    {q.questionText} {q.isRequired && "*"}
                  </Label>
                  {q.questionType === "text" && (
                    <Input
                      type="text"
                      onChange={(e) => handleInputChange(q._id, e.target.value)}
                      required={q.isRequired}
                    />
                  )}
                  {q.questionType === "radio" &&
                    q.options.map((opt) => (
                      <FormGroup check key={opt}>
                        <Label check>
                          <Input
                            type="radio"
                            name={q._id}
                            value={opt}
                            onChange={(e) =>
                              handleInputChange(q._id, e.target.value)
                            }
                            required={q.isRequired}
                          />{" "}
                          {opt}
                        </Label>
                      </FormGroup>
                    ))}
                  {q.questionType === "dropdown" && (
                    <Input
                      type="select"
                      onChange={(e) => handleInputChange(q._id, e.target.value)}
                      required={q.isRequired}
                    >
                      <option value="">Select an option</option>
                      {q.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Input>
                  )}
                  {q.questionType === "checkbox" &&
                    q.options.map((opt) => (
                      <FormGroup check key={opt}>
                        <Label check>
                          <Input
                            type="checkbox"
                            onChange={(e) => {
                              const current = answers[q._id] || [];
                              const newAnswers = e.target.checked
                                ? [...current, opt]
                                : current.filter((a) => a !== opt);
                              handleInputChange(q._id, newAnswers);
                            }}
                          />{" "}
                          {opt}
                        </Label>
                      </FormGroup>
                    ))}
                </FormGroup>
              );
            })}
            <Button color="primary" type="submit">
              Submit
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default FormViewer;
