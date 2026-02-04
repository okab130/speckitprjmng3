import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  ProjectOutlined, 
  BugOutlined, 
  BarChartOutlined, 
  AppstoreOutlined,
  DatabaseOutlined,
  FolderOutlined,
  DashboardOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const { Header, Content, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'ダッシュボード',
    },
    {
      key: '/projects',
      icon: <FolderOutlined />,
      label: 'プロジェクト',
    },
    {
      key: '/tasks',
      icon: <ProjectOutlined />,
      label: 'Tasks',
    },
    {
      key: '/kanban',
      icon: <AppstoreOutlined />,
      label: 'Kanban',
    },
    {
      key: '/gantt',
      icon: <BarChartOutlined />,
      label: 'Gantt',
    },
    {
      key: '/issues',
      icon: <BugOutlined />,
      label: 'Issues',
    },
    {
      key: '/functions',
      icon: <DatabaseOutlined />,
      label: '機能マスタ',
    },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#24292e',
      }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          Project Tracker
        </div>
        <div style={{ color: 'white' }}>
          {user?.name}
          <LogoutOutlined 
            style={{ marginLeft: 16, cursor: 'pointer' }} 
            onClick={handleLogout}
          />
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#f6f8fa' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
