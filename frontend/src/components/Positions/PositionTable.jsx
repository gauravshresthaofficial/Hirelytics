import React from "react";
import { Table, Space, Button, Popconfirm } from "antd";

const PositionTable = ({ data, loading, onEdit, onDelete }) => {
  const columns = [
    {
      title: "Title",
      dataIndex: "positionName",
      key: "positionName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this position?"
            onConfirm={() => onDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table rowKey="_id" loading={loading} columns={columns} dataSource={data} />
  );
};

export default PositionTable;
