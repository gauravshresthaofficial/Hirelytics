import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Modal, message } from "antd";
import { updateOfferStatus } from "../../features/candidate/candidateSlice";

const CandidateOfferStatusModal = ({ candidateId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const dispatch = useDispatch();

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      await dispatch(
        updateOfferStatus({
          candidateId,
          status: selectedStatus,
        })
      ).unwrap();

      message.success(`Offer ${selectedStatus.toLowerCase()} successfully`);
      setIsModalOpen(false);
    } catch (error) {
      message.error(error || `Failed to ${selectedStatus.toLowerCase()} offer`);
      console.error(error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedStatus(null);
  };

  // Determine button props based on selected status
  const modalButtonProps =
    selectedStatus === "Rejected"
      ? { style: { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" } }
      : {};

  return (
    <>
      <Button
        type="primary"
        style={{ marginRight: 8 }}
        onClick={() => handleStatusClick("Accepted")}
      >
        Accepted
      </Button>
      <Button
        type="primary"
        danger
        onClick={() => handleStatusClick("Rejected")}
      >
        Rejected
      </Button>

      <Modal
        title={`Confirm offer ${selectedStatus?.toLowerCase()}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={`Yes, mark as ${selectedStatus}`}
        cancelText="Cancel"
        centered
        okButtonProps={modalButtonProps}
      >
        <p>
          Are you sure you want to mark this offer as{" "}
          {selectedStatus?.toLowerCase()}?
        </p>
      </Modal>
    </>
  );
};

export default CandidateOfferStatusModal;
