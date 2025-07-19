import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Card,
  CardBody,
  CardTitle,
  Container,
  Row,
  Col,
  Button,
  Input,
  FormGroup,
  Form,
  CardHeader,
  CardFooter,
} from "reactstrap";
import Header from "components/Headers/Header.js";

const Index = () => {
  const [forms, setForms] = useState([]);
  const [newFormName, setNewFormName] = useState("");
  const navigate = useNavigate();

  // Function to fetch forms from the backend
  const fetchForms = async () => {
    try {
      const { data } = await api.get("/forms");
      setForms(data);
    } catch (error) {
      console.error("Could not fetch forms", error);
    }
  };

  useEffect(() => {
    fetchForms();
    window.addEventListener("focus", fetchForms);
    return () => {
      window.removeEventListener("focus", fetchForms);
    };
  }, []);

  /**
   * This is the function that handles form creation.
   * 1. It is triggered when the form is submitted.
   * 2. It sends a POST request to the backend with the new form's name.
   * 3. Upon success, it adds the new form to the state, updating the UI instantly.
   */
  const handleCreateForm = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    if (!newFormName.trim()) {
      alert("Please enter a name for your form.");
      return;
    }
    try {
      const { data: newForm } = await api.post("/forms", { name: newFormName });
      setForms((prevForms) => [...prevForms, newForm]);
      setNewFormName(""); // Clear the input field
    } catch (error) {
      alert("Failed to create form. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col xl="12" className="mb-5">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Create a New Form</h3>
                  </div>
                  <div className="col text-right">
                    <Button color="danger" onClick={handleLogout} size="sm">
                      Logout
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* The onSubmit handler is added to the Form tag */}
                <Form onSubmit={handleCreateForm}>
                  <FormGroup>
                    <Input
                      bsSize="lg"
                      value={newFormName}
                      onChange={(e) => setNewFormName(e.target.value)}
                      placeholder="E.g., Customer Feedback Survey"
                    />
                  </FormGroup>
                  {/* The button type is changed to "submit" */}
                  <Button color="primary" type="submit">
                    Create Form
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {forms.map((form) => (
            <Col key={form._id} xl="4" lg="6" className="mb-4">
              <Card className="card-stats mb-4 mb-xl-0 shadow">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-0"
                      >
                        {form.name}
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {form.submissions.length}
                      </span>
                      <p className="mt-0 mb-0 text-muted text-sm">
                        <span className="text-nowrap">Total Submissions</span>
                      </p>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-primary text-white rounded-circle shadow">
                        <i className="fas fa-file-alt" />
                      </div>
                    </Col>
                  </Row>
                  <hr className="my-3" />
                  <div className="d-flex justify-content-between">
                    <Button
                      color="info"
                      size="sm"
                      tag={Link}
                      to={`/admin/builder/${form._id}`}
                    >
                      <i className="fas fa-edit mr-2" />
                      Edit
                    </Button>
                    <Button
                      color="warning"
                      size="sm"
                      tag={Link}
                      to={`/admin/submissions/${form._id}`}
                    >
                      <i className="fas fa-chart-bar mr-2" />
                      Submissions
                    </Button>
                  </div>
                </CardBody>
                <CardFooter className="py-2">
                  <p className="mt-0 mb-0 text-muted text-sm">
                    <span className="text-nowrap">Share Link: </span>
                    <Link to={`/form/${form._id}`} target="_blank">
                      /form/{form._id}
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Index;
