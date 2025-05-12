import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Dropdown,
  Avatar,
  Space,
  Input,
  Modal,
  Typography,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SolutionOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import GlobalSearch from "../components/common/GlobalSearch";

const { Header, Sider, Content, Footer } = Layout;
const { Search } = Input;
const { Title } = Typography;

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const activeMenuKey = (() => {
    if (location.pathname.startsWith("/candidates")) return "2";
    if (location.pathname.startsWith("/assessments")) return "3";
    if (location.pathname.startsWith("/interviews")) return "4";
    if (location.pathname.startsWith("/positions")) return "5";
    if (location.pathname.startsWith("/evaluators")) return "6";
    return "1";
  })();

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const menuItems = [
    {
      key: "1",
      icon: <AppstoreOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: "Candidates",
      onClick: () => navigate("/candidates"),
    },
    {
      key: "3",
      icon: <FileTextOutlined />,
      label: "Assessments",
      onClick: () => navigate("/assessments"),
    },
    {
      key: "4",
      icon: <CalendarOutlined />,
      label: "Interviews",
      onClick: () => navigate("/interviews"),
    },
    {
      key: "5",
      icon: <SolutionOutlined />,
      label: "Positions",
      onClick: () => navigate("/positions"),
    },
    {
      key: "6",
      icon: <FileDoneOutlined />,
      label: "Evaluators",
      onClick: () => navigate("/evaluators"),
    },
  ];

  const profileMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <Title
          className="logo"
          style={{
            margin: "16px",
            color: "white",
            textAlign: "center",
            fontSize: "1.2rem",
          }}
        >
          {collapsed ? "H" : "Hirelytics"}
        </Title>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenuKey]}
          items={menuItems}
        />
      </Sider>

      <Layout
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "trigger",
                onClick: () => setCollapsed(!collapsed),
              }
            )}
          </div>

          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <GlobalSearch />
          </div>

          <Dropdown
            menu={{
              items: profileMenuItems,
              onClick: ({ key }) => {
                if (key === "logout") {
                  setIsLogoutModalOpen(true);
                } else if (key === "profile") {
                  navigate("/profile");
                }
              },
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.fullName || "Profile"}</span>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            padding: "16px",
            paddingRight: 24,
            paddingBottom: 0,
            marginBottom: "24px",
            // display: "flex",
            background: "#f5f5f5",
            overflowY: "scroll",
          }}
        >
          {children}
        </Content>
      </Layout>

      <Modal
        title="Do you want to logout?"
        open={isLogoutModalOpen}
        onOk={handleLogout}
        onCancel={handleCancel}
        okText="Logout"
        cancelText="Cancel"
        centered
      />
    </Layout>
  );
};

export default AppLayout;
