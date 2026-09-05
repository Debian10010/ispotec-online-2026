import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Logout from './pages/auth/Logout';
import Dashboard from './pages/dashboard/Dashboard';
import Feed from './pages/dashboard/Feed';
import UsersList from './pages/dashboard/UsersList';
import UsersPending from './pages/dashboard/UsersPending';
import GroupsManage from './pages/dashboard/GroupsManage';
import MyGroups from './pages/dashboard/MyGroups';
import GroupView from './pages/dashboard/GroupView';
import ChatGlobal from './pages/dashboard/ChatGlobal';
import ChatGrupo from './pages/dashboard/ChatGrupo';
import Chatbot from './pages/chatbot/Chatbot';
import IasEstudo from './pages/chatbot/IasEstudo';
import Profile from './pages/profile/Profile';
import PortfolioAdd from './pages/profile/PortfolioAdd';
import ProfileView from './pages/profile/ProfileView';
import UsersDirectory from './pages/users/UsersDirectory';

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/index.php" element={<Home />} />
        
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/login.php" element={<Login />} />
        
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/register.php" element={<Register />} />
        
        <Route path="/auth/logout" element={<Logout />} />
        <Route path="/auth/logout.php" element={<Logout />} />

        {/* Dashboard Routes (Protected) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/index.php" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/feed" 
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/feed.php" 
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/my-groups" 
          element={
            <ProtectedRoute>
              <MyGroups />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/my-groups.php" 
          element={
            <ProtectedRoute>
              <MyGroups />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/group-view" 
          element={
            <ProtectedRoute>
              <GroupView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/group-view.php" 
          element={
            <ProtectedRoute>
              <GroupView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/group-details.php" 
          element={
            <ProtectedRoute>
              <GroupView />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/chat-global" 
          element={
            <ProtectedRoute>
              <ChatGlobal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/chat-global.php" 
          element={
            <ProtectedRoute>
              <ChatGlobal />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/chat-grupo" 
          element={
            <ProtectedRoute>
              <ChatGrupo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/chat-grupo.php" 
          element={
            <ProtectedRoute>
              <ChatGrupo />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/dashboard/users-list" 
          element={
            <ProtectedRoute adminOnly={true}>
              <UsersList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/users-list.php" 
          element={
            <ProtectedRoute adminOnly={true}>
              <UsersList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/users-pending" 
          element={
            <ProtectedRoute adminOnly={true}>
              <UsersPending />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/users-pending.php" 
          element={
            <ProtectedRoute adminOnly={true}>
              <UsersPending />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard/groups-manage" 
          element={
            <ProtectedRoute adminOnly={true}>
              <GroupsManage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/groups-manage.php" 
          element={
            <ProtectedRoute adminOnly={true}>
              <GroupsManage />
            </ProtectedRoute>
          } 
        />

        {/* Chatbot Routes */}
        <Route 
          path="/chatbot" 
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chatbot/index.php" 
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/chatbot/ias-estudo" 
          element={
            <ProtectedRoute>
              <IasEstudo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chatbot/ias_estudo" 
          element={
            <ProtectedRoute>
              <IasEstudo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chatbot/ias_estudo.php" 
          element={
            <ProtectedRoute>
              <IasEstudo />
            </ProtectedRoute>
          } 
        />

        {/* Profile Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/index.php" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile/portfolio-add" 
          element={
            <ProtectedRoute>
              <PortfolioAdd />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/portfolio-add.php" 
          element={
            <ProtectedRoute>
              <PortfolioAdd />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile/view" 
          element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/view.php" 
          element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          } 
        />

        {/* Users Directory */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <UsersDirectory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users/index.php" 
          element={
            <ProtectedRoute>
              <UsersDirectory />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
