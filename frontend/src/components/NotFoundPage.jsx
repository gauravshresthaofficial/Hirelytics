import React, { useEffect } from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  // Function to navigate back, with a fallback to home
  const goBack = () => {
    navigate(-1); // Try to go back to the previous page
  };

  useEffect(() => {
    // Optional: You could add some logging or analytics here
    console.warn("404 - Page Not Found");
  }, []);

  return (
    <div
      style={{
        minHeight: "80vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={goBack}>
            Back to Previous
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;
