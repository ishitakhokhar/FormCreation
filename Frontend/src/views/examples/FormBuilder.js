import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Button,
  Input,
  FormGroup,
  Label,
  Form,
} from "reactstrap";
import Header from "components/Headers/Header.js";

const FormBuilder = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [question, setQuestion] = useState({
    questionText: "",
    questionType: "text",
    options: "",
    isRequired: false,
    conditionalLogic: {
      enabled: false,
      dependentQuestion: "",
      condition: "is equal to",
      value: "",
    },
  });

  const fetchForm = async () => {
    const { data } = await api.get(`/forms/${formId}`);
    setForm(data);
  };

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const handleQuestionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestion((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleConditionalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestion((prev) => ({
      ...prev,
      conditionalLogic: {
        ...prev.conditionalLogic,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const payload = {
      ...question,
      options: question.options.split(",").map((opt) => opt.trim()),
    };
    await api.post(`/forms/${formId}/questions`, payload);
    fetchForm();
    setQuestion({
      questionText: "",
      questionType: "text",
      options: "",
      isRequired: false,
      conditionalLogic: {
        enabled: false,
        dependentQuestion: "",
        condition: "is equal to",
        value: "",
      },
    });
  };

  if (!form) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col>
            <Card className="shadow">
              <CardHeader>
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Form Builder: {form.name}</h3>
                  </Col>
                  <Col className="text-right" xs="4">
                    <Button
                      color="primary"
                      tag={Link}
                      to="/admin/index"
                      size="sm"
                    >
                      Save & Finish
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="mb-4">
                  <h5>Existing Questions</h5>
                  {form.questions.length > 0 ? (
                    <ol>
                      {form.questions.map((q, i) => (
                        <li key={i}>
                          {q.questionText} ({q.questionType})
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>No questions added yet.</p>
                  )}
                </div>
                <hr />
                <Form onSubmit={handleAddQuestion}>
                  <h5>Add New Question</h5>
                  <FormGroup>
                    <Label>Question Text</Label>
                    <Input
                      name="questionText"
                      value={question.questionText}
                      onChange={handleQuestionChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Question Type</Label>
                    <Input
                      type="select"
                      name="questionType"
                      value={question.questionType}
                      onChange={handleQuestionChange}
                    >
                      <option value="text">Text</option>
                      <option value="radio">Radio Buttons</option>
                      <option value="checkbox">Checkboxes</option>
                      <option value="dropdown">Dropdown</option>
                    </Input>
                  </FormGroup>

                  {/* This block now only shows when the question type is NOT 'text' */}
                  {question.questionType !== "text" && (
                    <FormGroup>
                      <Label>Options (comma-separated)</Label>
                      <Input
                        name="options"
                        value={question.options}
                        onChange={handleQuestionChange}
                        placeholder="E.g., Option 1, Option 2, Option 3"
                      />
                    </FormGroup>
                  )}

                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="isRequired"
                        checked={question.isRequired}
                        onChange={handleQuestionChange}
                      />{" "}
                      Required
                    </Label>
                  </FormGroup>
                  <hr className="my-4" />
                  <h5>Conditional Logic</h5>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="enabled"
                        checked={question.conditionalLogic.enabled}
                        onChange={handleConditionalChange}
                      />{" "}
                      Enable Conditional Logic
                    </Label>
                  </FormGroup>
                  {question.conditionalLogic.enabled && (
                    <Row className="mt-3">
                      <Col md="4">
                        <FormGroup>
                          <Label>Show this field if:</Label>
                          <Input
                            type="select"
                            name="dependentQuestion"
                            value={question.conditionalLogic.dependentQuestion}
                            onChange={handleConditionalChange}
                            required
                          >
                            <option value="">Select a question...</option>
                            {form.questions.map((q) => (
                              <option key={q._id} value={q._id}>
                                {q.questionText}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label>Condition</Label>
                          <Input
                            type="select"
                            name="condition"
                            value={question.conditionalLogic.condition}
                            onChange={handleConditionalChange}
                          >
                            <option>is equal to</option>
                            <option>is not equal to</option>
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label>Value</Label>
                          <Input
                            name="value"
                            value={question.conditionalLogic.value}
                            onChange={handleConditionalChange}
                            required
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
                  <Button color="info" type="submit" className="mt-3">
                    Add Question
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default FormBuilder;
