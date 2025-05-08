import React from "react";
import { Modal } from "antd";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

const ConfirmLogout = ({ isModalOpen, setIsModalOpen }) => {
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Modal
      title="Do you want to logout?"
      open={isModalOpen}
      onOk={handleLogout}
      onCancel={handleCancel}
      okText="Logout"
      cancelText="Cancel"
      centered
    ></Modal>
  );
};

export default ConfirmLogout;
