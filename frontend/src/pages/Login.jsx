import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../features/auth/authSlice";
import { useGoogleLogin } from "@react-oauth/google";
import google from "/google.svg";
import {
  Flex,
  Typography,
  Button,
  message,
  Skeleton,
  Divider,
  Space,
  Card,
  Steps,
  Image,
} from "antd";
import {
  GoogleOutlined,
  PlusCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { DotChartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Step } = Steps;

const HiringStepsSkeleton = () => {
  return (
    <div
      style={{
        padding: "2rem",
        width: "40rem",
        position: "absolute",
        top: "14rem",
        left: "20rem",
        opacity: "60%",
      }}
    >
      <Steps current={1} size="default">
        <Step title="Applied" />
        <Step title="Assessment" />
        <Step title="Interview" />
        <Step title="Hired" />
      </Steps>
    </div>
  );
};

const ChartSkeleton = () => {
  const bars = Array.from({ length: 7 });

  return (
    <Card
      style={{
        height: 300,
        margin: "2rem auto",
        padding: "1.5rem",
        borderRadius: "16px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
        position: "fixed",
        bottom: "1rem",
        left: "8rem",
        width: "36rem",
        zIndex: "-1",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          height: "160px",
          padding: "0 12px",
          borderLeft: "1px solid #f0f0f0",
          borderBottom: "1px solid #f0f0f0",
          position: "relative",
        }}
      >
        {/* Y-axis ticks */}
        {[120, 80, 40, 0].map((val, i) => (
          <Text
            key={i}
            type="secondary"
            style={{
              position: "absolute",
              left: 0,
              bottom: `${(val / 160) * 100}%`,
              fontSize: 12,
              transform: "translateX(-110%)",
            }}
          >
            {val}
          </Text>
        ))}

        {/* Bars */}
        {bars.map((_, index) => (
          <div
            key={index}
            style={{
              width: 24,
              height: `${Math.random() * 140 + 40}px`,
              backgroundColor: "#f0f0f0",
              borderRadius: 4,
              animation: "pulse 1.5s infinite ease-in-out",
            }}
          />
        ))}
      </div>

      {/* X-axis labels (placeholder text) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
          padding: "0 12px",
        }}
      >
        {[
          "Applied",
          "Shortlisted",
          "Assessment",
          "Interview",
          "Offer",
          "Hired",
          "Rejected",
        ].map((day, idx) => (
          <Text key={idx} type="secondary" style={{ fontSize: 12 }}>
            {day}
          </Text>
        ))}
      </div>
    </Card>
  );
};

const SkeletonComponent = () => {
  const active = true;
  const block = true;
  const size = "default";
  const buttonShape = "default";
  const avatarShape = "circle";
  return (
    <Flex
      gap="middle"
      vertical
      style={{
        position: "fixed",
        top: 270,
        right: 200,
        width: "200px",
      }}
    >
      <Space>
        <Skeleton.Button
          active={active}
          size={size}
          shape={buttonShape}
          block={block}
        />
        <Skeleton.Avatar active={active} size={size} shape={avatarShape} />
        <Skeleton.Input active={active} size={size} />
      </Space>
      <Skeleton.Button
        active={active}
        size={size}
        shape={buttonShape}
        block={block}
      />
      <Skeleton.Input active={active} size={size} block={block} />
      <Space>
        <Skeleton.Image active={active} />
        <Skeleton.Node active={active} style={{ width: 160 }} />
        <Skeleton.Node active={active}>
          <DotChartOutlined style={{ fontSize: 40, color: "#bfbfbf" }} />
        </Skeleton.Node>
      </Space>
    </Flex>
  );
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

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
        console.error("Login failed", err);
      }
    } else {
      console.error("Google login failed: ", authResult);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  const ButtonComponent = ({ text }) => {
    return (
      <Button
        className="animated-pulse"
        icon={<PlusCircleOutlined />}
        size="large"
        color="primary"
        variant="outlined"
      >
        {text}
      </Button>
    );
  };

  useEffect(() => {
    const messages = [
      {
        content: "Candidate Hired Successfully",
        type: "success",
        placement: "topRight",
      },
      {
        content: "Candidate Rejected",
        type: "error",
        placement: "bottomLeft",
      },
    ];

    let index = 0;

    const interval = setInterval(() => {
      const current = messages[index % messages.length];
      message.open({
        content: current.content,
        type: current.type,
        className: "animated-message",
        style:
          current.placement === "topRight"
            ? { position: "fixed", right: "40%", top: 250 }
            : { position: "fixed", right: 350, top: 100 },
        duration: 2,
      });
      index++;
    }, 3000);

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <Flex
      style={{ width: "100vw", height: "100vh", overflow: "auto" }}
      vertical
    >
      <Flex
        justify="space-between"
        align="center"
        style={{ width: "100%", padding: "1.2rem 3rem 0 3rem" }}
      >
        <Title
          style={{
            fontSize: "1.2rem",
            fontWeight: 600,
          }}
        >
          Hirelytics
        </Title>
        <Button
          variant="outlined"
          shape="round"
          size="large"
          onClick={googleLogin}
          style={{ fontWeight: 500 }}
        >
          <Flex align="center" gap="small">
            <Image
              src={google}
              preview={false}
              style={{ width: "auto", height: 24 }}
            />
            Sign in with Google
          </Flex>
        </Button>
      </Flex>
      <Divider />
      <Flex
        style={{ flexGrow: 1, padding: "1rem 3rem", position: "relative" }}
        vertical
      >
        <Title
          style={{
            fontSize: "5rem",
            width: "80%",
            flexGrow: 1,
            fontWeight: 800,
          }}
        >
          Where Hiring Becomes a Smart Habit.
        </Title>
        <HiringStepsSkeleton />
        <SkeletonComponent />
        <ChartSkeleton />
        <TeamOutlined
          style={{
            fontSize: "8rem",
            opacity: "10%",
            position: "absolute",
            top: "1rem",
            right: "12rem",
          }}
        />

        <Card
          style={{
            position: "fixed",
            top: "0",
            right: "50%",
            transform: "translate(50%, -80%)",
            width: "36rem",
            zIndex: "-1",
          }}
        >
          <Skeleton avatar paragraph={{ rows: 4 }} active />
        </Card>
        <Card
          className="animate-moving"
          rounded
          style={{
            position: "fixed",
            right: 0,
            top: "4rem",
            width: "12px",
            height: "400px",
            background: "black",
            opacity: "40%",
          }}
        ></Card>
        <Flex justify="space-between" align="center" style={{ width: "100%" }}>
          <ButtonComponent text="Candidate" />
          <Text style={{ width: "45%", fontWeight: "lighter" }}>
            Hirelytics is a smart and intuitive hiring management platform built
            to simplify every step of your recruitment journey. From seamless
            candidate tracking to real-time application updates and performance
            insights, Hirelytics helps you make faster, smarter hiring
            decisions—all in one place. Say goodbye to messy spreadsheets and
            disconnected workflows. With clean design, powerful tools, and
            automated updates, Hirelytics keeps your team organized, efficient,
            and focused on finding the right talent. Whether you're a startup or
            a growing company, Hirelytics is the easiest way to streamline your
            hiring process and build stronger teams—faster.
          </Text>
        </Flex>
      </Flex>
      <Text
        type="secondary"
        style={{
          fontSize: 12,
          padding: "1rem 3rem ",
          width: "100%",
          textAlign: "center",
        }}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </Flex>
  );
};

export default Login;
