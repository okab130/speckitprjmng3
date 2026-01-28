import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './layouts/MainLayout';
import { theme } from './styles/theme';
import { RegisterForm } from './features/auth/RegisterForm';
import { LoginForm } from './features/auth/LoginForm';
import { TasksPage } from './features/tasks';
import { KanbanBoard } from './features/kanban';
import { IssuesPage } from './features/issues/IssuesPage';
import { GanttPage } from './features/gantt';
import { FunctionMasterPage } from './features/functions';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/kanban" element={<KanbanBoard />} />
                    <Route path="/gantt" element={<GanttPage />} />
                    <Route path="/issues" element={<IssuesPage />} />
                    <Route path="/functions" element={<FunctionMasterPage />} />
                    <Route path="/" element={<Navigate to="/tasks" />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
