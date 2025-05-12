import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../features/auth/authSlice";
import { useGoogleLogin } from "@react-oauth/google";
import {
  Flex,
  Typography,
  Button,
  Divider,
  Space,
  Card,
  Steps,
  Image,
  Grid,
  Col,
  Row,
  message,
} from "antd";
import {
  GoogleOutlined,
  TeamOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const { Step } = Steps;

const FeatureCard = ({ icon, title, description }) => {
  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        height: "100%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <Space direction="vertical" size="middle">
        <div style={{ fontSize: 32 }}>{icon}</div>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        <Text type="secondary">{description}</Text>
      </Space>
    </Card>
  );
};

const HiringProcessVisualization = () => {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Steps current={1} size="default" responsive={false}>
        <Step title="Applied" icon={<UserOutlined />} />
        <Step title="Screened" icon={<CheckCircleOutlined />} />
        <Step title="Interview" icon={<TeamOutlined />} />
        <Step title="Hired" icon={<DashboardOutlined />} />
      </Steps>
    </div>
  );
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { isLoading } = useSelector((state) => state.auth);

  const responseGoogle = async (authResult) => {
    if (authResult.code) {
      try {
        const result = await dispatch(
          loginWithGoogle(authResult.code)
        ).unwrap();
        if (result) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.log(err);
        message.error("Login failed. Please try again.");
      }
    } else {
      message.error("Google login failed. Please try again.");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden" }}>
      {/* Header */}
      <header
        style={{
          padding: screens.xs ? "1rem" : "1.5rem 3rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Title
          level={3}
          style={{
            margin: 0,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <LineChartOutlined />
          Hirelytics
        </Title>
        <Space>
          <Button
            type="text"
            size="large"
            onClick={() => {
              const featuresSection = document.getElementById("features");
              if (featuresSection) {
                featuresSection.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }}
          >
            Features
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={googleLogin}
            icon={<GoogleOutlined />}
            loading={isLoading}
          >
            Get Started
          </Button>
        </Space>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: screens.xs ? "2rem 1rem" : "4rem 3rem",
          position: "relative",
        }}
      >
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <Title
              style={{
                fontSize: screens.xs
                  ? "2.5rem"
                  : screens.md
                  ? "3.5rem"
                  : "4rem",
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: 24,
              }}
            >
              Where Hiring Becomes a{" "}
              <span style={{ color: "#1890ff" }}>Smart Habit</span>
            </Title>
            <Text
              style={{
                fontSize: screens.xs ? 16 : 18,
                display: "block",
                marginBottom: 40,
                color: "#444",
              }}
            >
              Streamline your recruitment process with powerful analytics and
              intuitive candidate management.
            </Text>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                onClick={googleLogin}
                icon={<GoogleOutlined />}
                loading={isLoading}
              >
                Get Started
              </Button>
              <Button size="large">Learn More</Button>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Card
              style={{
                borderRadius: 16,
                boxShadow: "0 16px 32px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              <HiringProcessVisualization />
              <div style={{ height: 300, position: "relative", marginTop: 24 }}>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "80%",
                    background: "linear-gradient(to right, #1890ff, #36cfc9)",
                    borderRadius: 8,
                    opacity: 0.1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "10%",
                    left: "10%",
                    right: "10%",
                    height: "60%",
                    background: "linear-gradient(to right, #1890ff, #36cfc9)",
                    borderRadius: 8,
                    opacity: 0.2,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "20%",
                    left: "20%",
                    right: "20%",
                    height: "40%",
                    background: "linear-gradient(to right, #1890ff, #36cfc9)",
                    borderRadius: 8,
                    opacity: 0.3,
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          padding: screens.xs ? "2rem 1rem" : "4rem 3rem",
          background: "#f9f9f9",
        }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: 48 }}>
          Powerful Features for{" "}
          <span style={{ color: "#1890ff" }}>Smart Hiring</span>
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <FeatureCard
              icon={<DashboardOutlined />}
              title="Real-time Analytics"
              description="Track your hiring pipeline with live dashboards and comprehensive metrics."
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FeatureCard
              icon={<TeamOutlined />}
              title="Candidate Management"
              description="Organize applicants through every stage of your hiring process."
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <FeatureCard
              icon={<CheckCircleOutlined />}
              title="Smart Pipeline Routing"
              description="Automatically move candidates to next stages based on assessment scores and interview feedback."
            />
          </Col>
        </Row>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: screens.xs ? "3rem 1rem" : "5rem 3rem",
          textAlign: "center",
        }}
      >
        <Title level={2} style={{ marginBottom: 16 }}>
          Ready to Transform Your Hiring Process?
        </Title>
        <Text
          style={{
            fontSize: screens.xs ? 16 : 18,
            display: "block",
            marginBottom: 40,
            color: "#444",
            maxWidth: 800,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Join hundreds of companies who have made hiring smarter with
          Hirelytics.
        </Text>
        <Button
          type="primary"
          size="large"
          onClick={googleLogin}
          icon={<GoogleOutlined />}
          loading={isLoading}
          style={{ height: 50, padding: "0 32px", fontSize: 16 }}
        >
          Get Started for Free
        </Button>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem 3rem",
          background: "#001529",
          color: "rgba(255,255,255,0.65)",
        }}
      >
        <Row gutter={[48, 24]}>
          <Col xs={24} md={8}>
            <Title
              level={4}
              style={{ color: "rgba(255,255,255,0.9)", marginBottom: 16 }}
            >
              <LineChartOutlined /> Hirelytics
            </Title>
            <Text>
              Making hiring smarter, faster, and more efficient through data and
              automation.
            </Text>
          </Col>
          <Col xs={24} md={8}>
            <Title
              level={4}
              style={{ color: "rgba(255,255,255,0.9)", marginBottom: 16 }}
            >
              Resources
            </Title>
            <Space direction="vertical">
              <a href="#" style={{ color: "rgba(255,255,255,0.65)" }}>
                Documentation
              </a>
              <a href="#" style={{ color: "rgba(255,255,255,0.65)" }}>
                Blog
              </a>
              <a href="#" style={{ color: "rgba(255,255,255,0.65)" }}>
                Support
              </a>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Title
              level={4}
              style={{ color: "rgba(255,255,255,0.9)", marginBottom: 16 }}
            >
              Legal
            </Title>
            <Space direction="vertical">
              <a href="#" style={{ color: "rgba(255,255,255,0.65)" }}>
                Privacy Policy
              </a>
              <a href="#" style={{ color: "rgba(255,255,255,0.65)" }}>
                Terms of Service
              </a>
            </Space>
          </Col>
        </Row>
        <Divider style={{ borderColor: "rgba(255,255,255,0.1)" }} />
        <Text
          style={{
            textAlign: "center",
            display: "block",
            color: "rgba(255,255,255,0.65)",
          }}
        >
          © {new Date().getFullYear()} Hirelytics. All rights reserved.
        </Text>
      </footer>
    </div>
  );
};

export default Login;
