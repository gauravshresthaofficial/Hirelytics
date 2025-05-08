import React, { useEffect, useState } from "react";
import {
  Input,
  Flex,
  Card,
  Button,
  Table,
  Space,
  Select,
  Typography,
  Avatar,
  Tag,
} from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import EvaluatorFormModal from "../components/evaluators/EvaluatorModalForm";
import { fetchUsers } from "../features/user/userSlice";

const EvaluatorPage = () => {
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const users = useSelector((state) => state.users.data || []);
  const loading = useSelector((state) => state.users.loading);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Filter only evaluators and apply search filter
  const filteredData = users
    .filter((user) => user.role.toLowerCase() === "evaluator")
    .filter((user) =>
      user.fullName.toLowerCase().includes(searchText.toLowerCase())
    );

  const columns = [
    {
      title: "Profile",
      dataIndex: "picture",
      key: "picture",
      render: (picture, record) => (
        <Avatar src={picture} alt={record.fullName} />
      ),
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "Evaluator" ? "blue" : "default"}>{role}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(`/evaluators/${record._id.$oid || record._id}`)
            }
          >
            View
          </Button>
          <EvaluatorFormModal isEditing={true} initialValues={record} />
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ width: "100%" }}>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: 16 }}
        wrap
        gap={16}
      >
        <Flex gap={12}>
          <Input
            placeholder="Search by name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Flex>

        <EvaluatorFormModal isEditing={false} />
      </Flex>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => record._id.$oid || record._id}
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} evaluators`,
        }}
      />
    </Card>
  );
};

export default EvaluatorPage;
