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
  message,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PositionFormModal from "../components/Positions/PositionModalForm";
import { useDispatch, useSelector } from "react-redux";
import { fetchPositions } from "../features/position/positionSlice";

const { Option } = Select;
const { Text } = Typography;

const PositionPage = () => {
  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    data: positions,
    error,
    loading,
  } = useSelector((state) => state.positions);

  useEffect(() => {
    dispatch(fetchPositions());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Extract unique department names for filters
  const departmentOptions = [
    ...new Set(positions.map((p) => p.department).filter(Boolean)),
  ];

  const filteredData = positions
    .filter((item) =>
      item.positionName.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((item) =>
      departmentFilter ? item.department === departmentFilter : true
    );

  const columns = [
    {
      title: "Position",
      dataIndex: "positionName",
      key: "positionName",
      sorter: (a, b) => a.positionName.localeCompare(b.positionName),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      sorter: (a, b) => a.department?.localeCompare(b.department || ""),
    },
    {
      title: "Salary Range (in NPR)",
      key: "salary",
      sorter: (a, b) => (a.salaryRange?.min || 0) - (b.salaryRange?.min || 0),
      render: (_, record) => {
        const min = record.salaryRange?.min || 0;
        const max = record.salaryRange?.max || 0;
        return `${min.toLocaleString()} - ${max.toLocaleString()}`;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/positions/${record._id}`)}
          >
            View
          </Button>
          <PositionFormModal isEditing={true} initialValues={record} />
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
            placeholder="Search by position name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />

          <Select
            allowClear
            placeholder="Filter by department"
            value={departmentFilter}
            onChange={(value) => setDepartmentFilter(value)}
            style={{ width: 200 }}
          >
            {departmentOptions.map((dep) => (
              <Option key={dep} value={dep}>
                {dep}
              </Option>
            ))}
          </Select>
        </Flex>

        <PositionFormModal isEditing={false} />
      </Flex>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} positions`,
        }}
      />
    </Card>
  );
};

export default PositionPage;
