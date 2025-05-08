import React, { useEffect, useState } from "react";
import { Input, Button, message, Form, Flex, Select, Card, Space } from "antd";
import { SearchOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssessments,
  createAssessment,
} from "../features/assessment/assessmentSlice";
import AssessmentFormModal from "../components/Assessments/AssessmentFormModal";
import AssessmentTable from "../components/Assessments/AssessmentTable";

const { Option } = Select;

const AssessmentPage = () => {
  const dispatch = useDispatch();
  const { data: assessments, loading } = useSelector(
    (state) => state.assessments
  );

  const [searchText, setSearchText] = useState("");
  const [filterDuration, setFilterDuration] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const getAssessments = async () => {
      try {
        await dispatch(fetchAssessments()).unwrap();
      } catch (error) {
        message.error(error);
      }
    };

    getAssessments();
  }, [dispatch]);

  useEffect(() => {
    const filtered = assessments
      .filter((assessment) =>
        assessment.assessmentName
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
      .filter((assessment) => {
        if (filterDuration === null) return true;
        if (filterDuration === "<30") return assessment.duration < 30;
        if (filterDuration === "30-60")
          return assessment.duration >= 30 && assessment.duration <= 60;
        if (filterDuration === ">60") return assessment.duration > 60;
        return true;
      });
    setFilteredData(filtered);
  }, [searchText, filterDuration, assessments]);

  return (
    <Card style={{ width: "100%", overflowY: "auto" }}>
      <Flex
        justify="space-between"
        style={{ width: "100%", marginBottom: "16px" }}
      >
        <Space gap="small">
          <Input
            placeholder="Search by name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={filterDuration}
            onChange={setFilterDuration}
            style={{ width: 180 }}
            allowClear
            placeholder="All Durations"
          >
            <Option value="<30">Less than 30 mins</Option>
            <Option value="30-60">30-60 mins</Option>
            <Option value=">60">More than 60 mins</Option>
          </Select>
        </Space>

        <AssessmentFormModal isEditing={false} />
      </Flex>

      <AssessmentTable data={filteredData} loading={loading} />
    </Card>
  );
};

export default AssessmentPage;
