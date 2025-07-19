// In src/views/examples/SubmissionsView.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import {
  Card,
  CardHeader,
  Table,
  Container,
  Row,
  Col,
  Button,
} from "reactstrap";
import Header from "components/Headers/Header.js";

const SubmissionsView = () => {
  const { formId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formRes = await api.get(`/forms/${formId}`);
        setForm(formRes.data);
        const subRes = await api.get(`/submissions/${formId}`);
        setSubmissions(subRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, [formId]);

  const handleExport = async () => {
    const response = await api.get(`/submissions/${formId}/export/csv`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${form.name}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
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
                <h3 className="mb-0">Submissions: {form.name}</h3>
                <Link to="/admin/index">← Back to Dashboard</Link>
                <Button
                  color="success"
                  size="sm"
                  onClick={handleExport}
                  className="float-right"
                >
                  Export to CSV
                </Button>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    {form.questions.map((q) => (
                      <th key={q._id}>{q.questionText}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub._id}>
                      {form.questions.map((q) => {
                        const answerObj = sub.answers.find(
                          (a) => a.questionId === q._id
                        );
                        const answer = answerObj
                          ? Array.isArray(answerObj.answer)
                            ? answerObj.answer.join(", ")
                            : answerObj.answer
                          : "N/A";
                        return <td key={q._id}>{answer}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SubmissionsView;
