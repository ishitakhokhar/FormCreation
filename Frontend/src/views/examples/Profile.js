import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
  CardTitle,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [forms, setForms] = useState([]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await api.get("/auth/profile");
        setUser(profileRes.data);
        setName(profileRes.data.name);

        const formsRes = await api.get("/forms");
        setForms(formsRes.data);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      }
    };
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const updateData = { name };
      if (password) {
        updateData.password = password;
      }
      const { data } = await api.put("/auth/profile", updateData);
      setUser(data);
      setName(data.name);
      setPassword("");
      setConfirmPassword("");
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile.");
    }
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
            <Card className="card-profile shadow">
              <CardBody className="pt-0 pt-md-4">
                <div className="text-center mt-md-5">
                  <h3>{user.name}</h3>
                  <div className="h5 font-weight-300">
                    <i className="ni location_pin mr-2" />
                    {user.email}
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card className="shadow mt-4">
              <CardHeader>
                <h3 className="mb-0">My Forms (Activity)</h3>
              </CardHeader>
              <CardBody>
                <ListGroup flush>
                  {forms.map((form) => (
                    <ListGroupItem
                      key={form._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {form.name}
                      <span className="badge badge-primary badge-pill">
                        {form.submissions.length} Submissions
                      </span>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
          <Col className="order-xl-1" xl="8">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">My account</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleUpdateProfile}>
                  <h6 className="heading-small text-muted mb-4">
                    User information
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="12">
                        <FormGroup>
                          <label
                            className="form-control-label"
                            htmlFor="input-username"
                          >
                            Name
                          </label>
                          <Input
                            className="form-control-alternative"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            id="input-username"
                            placeholder="Your Name"
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  <hr className="my-4" />
                  <h6 className="heading-small text-muted mb-4">
                    Change Password
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label
                            className="form-control-label"
                            htmlFor="input-password"
                          >
                            New Password
                          </label>
                          <Input
                            className="form-control-alternative"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="input-password"
                            placeholder="New Password"
                            type="password"
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label
                            className="form-control-label"
                            htmlFor="input-confirm-password"
                          >
                            Confirm Password
                          </label>
                          <Input
                            className="form-control-alternative"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            id="input-confirm-password"
                            placeholder="Confirm Password"
                            type="password"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  <div className="text-right">
                    <Button color="primary" type="submit">
                      Update Profile
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
