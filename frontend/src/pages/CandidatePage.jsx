import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchCandidates,
  createCandidate,
  updateCandidate,
} from "../features/candidate/candidateSlice";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Select,
  Input,
  message,
  Space,
  Flex,
} from "antd";
import CandidateTable from "../components/Candidates/CandidateTable";
import CandidateFormModal from "../components/Candidates/CandidateFormModal";
import { fetchPositions } from "../features/position/positionSlice";
import { SearchOutlined, PlusCircleOutlined } from "@ant-design/icons";

const CandidatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = location.state || {};
  const statusFilter = status ? [status] : [];

  const { data: candidates, loading } = useSelector(
    (state) => state.candidates
  );
  const positions = useSelector((state) => state.positions.data);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  useEffect(() => {
    if (!candidates.length) dispatch(fetchCandidates());
  }, [dispatch, candidates]);

  useEffect(() => {
    if (!positions.length) dispatch(fetchPositions());
  }, [dispatch, positions]);

  useEffect(() => {
    if (location.state?.pagination) {
      setPagination(location.state.pagination);
    }
  }, [location.state]);
  useEffect(() => {
    if (location.state?.status) {
      setFilteredInfo((prev) => ({
        ...prev,
        currentStatus: [location.state.status],
      }));
    }
  }, [location.state]);

  const handleSearchChange = (value) => {
    setSearchText(value.toLowerCase());
  };

  const handlePaginationChange = (current, pageSize) => {
    setPagination({ current, pageSize });
  };

  const handleViewProfile = (candidate) => {
    navigate(`/candidates/${candidate._id}`, {
      state: { pagination },
    });
  };

  const handleCreate = () => {
    setIsEditing(false);
    setEditingCandidate(null);
    setIsModalVisible(true);
  };

  const handleEdit = (candidate) => {
    setIsEditing(true);
    setEditingCandidate(candidate);
    setIsModalVisible(true);
  };

  const role = useSelector((state) => state.auth.user.role);

  const handleSubmit = async (candidateData) => {
    try {
      if (isEditing) {
        await dispatch(
          updateCandidate({
            id: editingCandidate._id,
            updatedData: candidateData,
          })
        ).unwrap();
        message.success("Candidate updated successfully!");
      } else {
        await dispatch(createCandidate(candidateData)).unwrap();
        message.success("The candidate was created Successfully");
      }
      setIsModalVisible(false);
    } catch (err) {
      message.error(err || "Failed to save candidate.");
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates?.filter((candidate) => {
      const matchesSearch =
        candidate?.fullName?.toLowerCase().includes(searchText) ||
        candidate?.email?.toLowerCase().includes(searchText);
      return matchesSearch;
    });
  }, [candidates, searchText]);

  const positionOptions = positions.map((position) => ({
    text: position.positionName,
    value: position.positionName,
  }));

  return (
    <Card style={{ width: "100%", overflowY: "auto" }}>
      <Flex justify="space-between" style={{ marginBottom: "16px" }}>
        <Space gap="small">
          <Input
            placeholder="Search by name or email"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
        {role.toLowerCase() != "evaluator" && (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleCreate}
          >
            Add Candidate
          </Button>
        )}
      </Flex>

      {/* Table */}
      <CandidateTable
        data={filteredCandidates}
        loading={loading}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onViewProfile={handleViewProfile}
        onEdit={handleEdit}
        statusFilter={statusFilter}
        positionOptions={positionOptions}
        filteredInfo={filteredInfo}
        setFilteredInfo={setFilteredInfo}
      />

      {/* Modal */}
      <CandidateFormModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        initialValues={editingCandidate}
        positionOptions={positionOptions}
      />
    </Card>
  );
};

export default CandidatePage;
