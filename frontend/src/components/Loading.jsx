// ../components/Loading.js
import React from "react";
import { Spin } from "antd";

const Loading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
    }}
  >
    <Spin size="large" />
  </div>
);

export default Loading;
