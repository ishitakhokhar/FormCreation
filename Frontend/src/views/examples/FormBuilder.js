// src/views/examples/FormBuilder.js (for designing the form structure)

import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardBody, Container, Row, Col, Button, Form, FormGroup, Label, Input
} from 'reactstrap';
import Header from 'components/Headers/Header.js';
import { useParams, useNavigate } from 'react-router-dom';
import api from 'services/api';

const FormBuilder = () => {
  const { formId } = useParams(); // For editing existing forms
  const navigate = useNavigate();
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [questions, setQuestions] = useState([]); // This will hold the array of question objects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      if (formId) {
        try {
          setLoading(true);
          const response = await api.get(`/forms/${formId}`);
          setFormName(response.data.name);
          setFormDescription(response.data.description || '');
          setQuestions(response.data.questions || []);
        } catch (err) {
          console.error('Error fetching form:', err);
          setError('Failed to load form for editing.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // No formId, so it's a new form
      }
    };
    fetchForm();
  }, [formId]);

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`, // Simple unique ID for now
      label: '',
      type: 'text',
      required: false,
      options: [],
      placeholder: '',
      visibilityRule: null // Initially no rule
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;

    // Special handling for 'select'/'radio'/'checkbox' types to manage options
    if (field === 'type' && ['select', 'radio', 'checkbox'].includes(value)) {
        updatedQuestions[index].options = ['Option 1', 'Option 2']; // Default options
    } else if (field === 'type') {
        updatedQuestions[index].options = []; // Clear options if type changes
    }

    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.splice(optIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // --- NEW: Handle Conditional Rule Changes ---
  const handleRuleChange = (qIndex, field, value) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[qIndex].visibilityRule) {
      updatedQuestions[qIndex].visibilityRule = { fieldId: '', operator: 'equals', value: '' };
    }
    updatedQuestions[qIndex].visibilityRule[field] = value;
    setQuestions(updatedQuestions);
  };

  const handleToggleRule = (qIndex) => {
      const updatedQuestions = [...questions];
      if (updatedQuestions[qIndex].visibilityRule) {
          updatedQuestions[qIndex].visibilityRule = null; // Remove rule
      } else {
          // Add a default rule when toggled on
          updatedQuestions[qIndex].visibilityRule = { fieldId: '', operator: 'equals', value: '' };
      }
      setQuestions(updatedQuestions);
  };
  // --- END NEW ---

  const handleSaveForm = async () => {
    try {
      const formData = {
        name: formName,
        description: formDescription,
        questions: questions
      };

      if (formId) {
        await api.put(`/forms/${formId}`, formData);
        alert('Form updated successfully!');
        navigate(`/admin/index`); // Redirect to edit mode
      } else {
        const response = await api.post('/forms', formData);
        alert('Form created successfully!');
        navigate(`/admin/index`); // Redirect to edit mode
      }
    } catch (err) {
      console.error('Error saving form:', err.response ? err.response.data : err.message);
      setError('Failed to save form. ' + (err.response ? err.response.data.message : ''));
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="mt--7" fluid>
          <div>Loading form definition...</div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-1" xl="12">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">{formId ? 'Edit Form' : 'Create New Form'}</h3>
                  </div>
                  <div className="col text-right">
                    <Button color="primary" onClick={handleSaveForm} size="sm">
                      {formId ? 'Update Form' : 'Save Form'}
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <Form>
                  <FormGroup>
                    <Label for="formName">Form Name</Label>
                    <Input type="text" id="formName" value={formName} onChange={(e) => setFormName(e.target.value)} />
                  </FormGroup>
                  <FormGroup>
                    <Label for="formDescription">Form Description</Label>
                    <Input type="textarea" id="formDescription" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                  </FormGroup>

                  <hr className="my-4" />
                  <h5>Form Questions</h5>
                  {questions.map((q, qIndex) => (
                    <Card key={q.id} className="mb-3 p-3 border">
                      <Row className="align-items-center mb-3">
                        <Col xs="auto">
                          <h6>Question {qIndex + 1}</h6>
                        </Col>
                        <Col className="text-right">
                          <Button color="danger" size="sm" onClick={() => handleRemoveQuestion(qIndex)}>
                            Remove
                          </Button>
                        </Col>
                      </Row>
                      <FormGroup>
                        <Label for={`q-label-${q.id}`}>Label</Label>
                        <Input
                          type="text"
                          id={`q-label-${q.id}`}
                          value={q.label}
                          onChange={(e) => handleQuestionChange(qIndex, 'label', e.target.value)}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for={`q-id-${q.id}`}>Field ID (Unique Identifier)</Label>
                        <Input
                          type="text"
                          id={`q-id-${q.id}`}
                          value={q.id}
                          onChange={(e) => handleQuestionChange(qIndex, 'id', e.target.value)}
                          disabled={formId ? true : false} // Disable editing ID for existing forms
                        />
                        <small className="form-text text-muted">Use unique, descriptive IDs (e.g., 'designationField', 'teamSize'). This is used for conditional logic.</small>
                      </FormGroup>
                      <FormGroup>
                        <Label for={`q-type-${q.id}`}>Type</Label>
                        <Input
                          type="select"
                          id={`q-type-${q.id}`}
                          value={q.type}
                          onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="number">Number</option>
                          <option value="select">Dropdown (Select)</option>
                          <option value="radio">Radio Buttons</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="date">Date</option>
                          <option value="email">Email</option>
                        </Input>
                      </FormGroup>
                      {(q.type === 'select' || q.type === 'radio' || q.type === 'checkbox') && (
                        <FormGroup>
                          <Label>Options</Label>
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex} className="d-flex mb-2">
                              <Input
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                className="mr-2"
                              />
                              <Button color="secondary" size="sm" onClick={() => handleRemoveOption(qIndex, optIndex)}>X</Button>
                            </div>
                          ))}
                          <Button color="info" size="sm" onClick={() => handleAddOption(qIndex)}>Add Option</Button>
                        </FormGroup>
                      )}
                      <FormGroup check className="mb-3">
                        <Input
                          type="checkbox"
                          id={`q-required-${q.id}`}
                          checked={q.required}
                          onChange={(e) => handleQuestionChange(qIndex, 'required', e.target.checked)}
                        />
                        <Label check for={`q-required-${q.id}`}>Required</Label>
                      </FormGroup>
                      <FormGroup>
                        <Label for={`q-placeholder-${q.id}`}>Placeholder (Optional)</Label>
                        <Input
                          type="text"
                          id={`q-placeholder-${q.id}`}
                          value={q.placeholder}
                          onChange={(e) => handleQuestionChange(qIndex, 'placeholder', e.target.value)}
                        />
                      </FormGroup>

                      {/* --- NEW: Conditional Logic UI --- */}
                      <hr className="my-3" />
                      <FormGroup className="mb-3">
                        <div className="d-flex align-items-center">
                          <Input
                            type="checkbox"
                            id={`q-rule-toggle-${q.id}`}
                            checked={!!q.visibilityRule}
                            onChange={() => handleToggleRule(qIndex)}
                            className="mr-2"
                          />
                          <Label check for={`q-rule-toggle-${q.id}`}>Conditional Visibility</Label>
                        </div>
                      </FormGroup>

                      {q.visibilityRule && (
                        <div className="border p-3 rounded bg-light mb-3">
                          <h6>Show this field if:</h6>
                          <FormGroup>
                            <Label for={`rule-field-${q.id}`}>Field</Label>
                            <Input
                              type="select"
                              id={`rule-field-${q.id}`}
                              value={q.visibilityRule.fieldId}
                              onChange={(e) => handleRuleChange(qIndex, 'fieldId', e.target.value)}
                            >
                              <option value="">Select a field</option>
                              {/* Populate with IDs of other questions in the form */}
                              {questions.map(otherQ => (
                                otherQ.id !== q.id && ( // Cannot depend on self
                                  <option key={otherQ.id} value={otherQ.id}>{otherQ.label} ({otherQ.id})</option>
                                )
                              ))}
                            </Input>
                          </FormGroup>
                          <FormGroup>
                            <Label for={`rule-operator-${q.id}`}>Operator</Label>
                            <Input
                              type="select"
                              id={`rule-operator-${q.id}`}
                              value={q.visibilityRule.operator}
                              onChange={(e) => handleRuleChange(qIndex, 'operator', e.target.value)}
                            >
                              <option value="equals">Equals</option>
                              <option value="notEquals">Does Not Equal</option>
                              <option value="greaterThan">Greater Than</option>
                              <option value="lessThan">Less Than</option>
                              <option value="contains">Contains</option>
                            </Input>
                          </FormGroup>
                          <FormGroup>
                            <Label for={`rule-value-${q.id}`}>Value</Label>
                            <Input
                              type="text" // Could be dynamic based on the type of the `fieldId`
                              id={`rule-value-${q.id}`}
                              value={q.visibilityRule.value}
                              onChange={(e) => handleRuleChange(qIndex, 'value', e.target.value)}
                            />
                          </FormGroup>
                        </div>
                      )}
                      {/* --- END NEW: Conditional Logic UI --- */}

                    </Card>
                  ))}
                  <Button color="success" className="mt-3" onClick={handleAddQuestion}>Add Question</Button>
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