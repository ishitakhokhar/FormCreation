import React, { useState } from "react";
import {
  Card, CardHeader, CardBody, Container, Row, Col, Button, Input, FormGroup, Label
} from "reactstrap";

const FIELD_TYPES = [
  { type: "text", label: "Text" },
  { type: "email", label: "Email" },
  { type: "password", label: "Password" },
  { type: "checkbox", label: "Checkbox" },
  { type: "date", label: "Date" },
  { type: "number", label: "Number" },
  { type: "range", label: "Range" },
  { type: "radio", label: "Radio" },
];

const DEFAULT_RADIO_OPTIONS = ["Option 1", "Option 2"];

const FormBuilderTab = () => {
  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState({});

  const addField = (type) => {
    setFields([
      ...fields,
      {
        id: Date.now(),
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
        name: `field_${fields.length + 1}`,
        ...(type === "radio" ? { options: [...DEFAULT_RADIO_OPTIONS] } : {}),
      },
    ]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const updateRadioOption = (fieldId, idx, value) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        const newOptions = [...f.options];
        newOptions[idx] = value;
        return { ...f, options: newOptions };
      }
      return f;
    }));
  };

  const addRadioOption = (fieldId) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, options: [...f.options, `Option ${f.options.length + 1}`] };
      }
      return f;
    }));
  };

  const removeRadioOption = (fieldId, idx) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        const newOptions = f.options.filter((_, i) => i !== idx);
        return { ...f, options: newOptions };
      }
      return f;
    }));
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleInputChange = (e, field) => {
    const { type, checked, value, name } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  return (
    <Container className="mt--7" fluid>
      <Row style={{ margin: "10px" , maxWidth: "1800px" ,alignSelf: "center",padding: "100px 20px",width: "100%" ,minHeight: "100vh",display: "flex", justifyContent: "center", alignItems: "center"}}>
        {/* Left Panel: Field Picker */}
        <Col md="4">
          <Card className="shadow">
            <CardHeader>
              <h3 className="mb-0">Add Fields</h3>
            </CardHeader>
            <CardBody>
              {FIELD_TYPES.map(ft => (
                <Button
                  key={ft.type}
                  color="primary"
                  className="mb-2"
                  block
                  onClick={() => addField(ft.type)}
                >
                  {ft.label}
                </Button>
              ))}
            </CardBody>
          </Card>
        </Col>
        {/* Right Panel: Form Preview & Edit */}
        <Col md="8">
          <Card className="shadow">
            <CardHeader>
              <h3 className="mb-0">Form Preview</h3>
            </CardHeader>
            <CardBody>
              {fields.length === 0 && <div className="text-muted">Add fields to build your form.</div>}
              <form>
                {fields.map((field, idx) => (
                  <FormGroup key={field.id} className="mb-3">
                    <Row>
                      <Col md="4">
                        <Input
                          type="text"
                          value={field.label}
                          onChange={e => updateField(field.id, "label", e.target.value)}
                          placeholder="Label"
                        />
                      </Col>
                      <Col md="3">
                        <Input
                          type="select"
                          value={field.type}
                          onChange={e => updateField(field.id, "type", e.target.value)}
                        >
                          {FIELD_TYPES.map(ft => (
                            <option key={ft.type} value={ft.type}>{ft.label}</option>
                          ))}
                        </Input>
                      </Col>
                      <Col md="3">
                        <Button color="danger" onClick={() => removeField(field.id)}>
                          Remove
                        </Button>
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        {field.type === "checkbox" ? (
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="checkbox"
                                name={field.name}
                                checked={!!formValues[field.name]}
                                onChange={e => handleInputChange(e, field)}
                              />{" "}
                              {field.label}
                            </Label>
                          </FormGroup>
                        ) : field.type === "radio" ? (
                          <>
                            <Label>{field.label}</Label>
                            {field.options.map((option, i) => (
                              <FormGroup check inline key={i}>
                                <Label check>
                                  <Input
                                    type="radio"
                                    name={field.name}
                                    value={option}
                                    checked={formValues[field.name] === option}
                                    onChange={e => handleInputChange(e, field)}
                                  />{" "}
                                  <Input
                                    type="text"
                                    value={option}
                                    onChange={e => updateRadioOption(field.id, i, e.target.value)}
                                    style={{ width: 100, display: "inline-block", marginRight: 8 }}
                                  />
                                  <Button
                                    size="sm"
                                    color="danger"
                                    onClick={() => removeRadioOption(field.id, i)}
                                    style={{ marginLeft: 4 }}
                                    disabled={field.options.length <= 1}
                                  >×</Button>
                                </Label>
                              </FormGroup>
                            ))}
                            <Button
                              size="sm"
                              color="secondary"
                              onClick={() => addRadioOption(field.id)}
                              style={{ marginTop: 8 }}
                            >Add Option</Button>
                          </>
                        ) : (
                          <>
                            <Label>{field.label}</Label>
                            <Input
                              type={field.type}
                              name={field.name}
                              value={formValues[field.name] || ""}
                              onChange={e => handleInputChange(e, field)}
                            />
                          </>
                        )}
                      </Col>
                    </Row>
                  </FormGroup>
                ))}
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FormBuilderTab;