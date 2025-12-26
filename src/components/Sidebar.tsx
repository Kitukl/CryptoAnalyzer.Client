import { useEffect, useState } from 'react';
import { Menu, Avatar, Button, Typography, Spin } from 'antd';
import { 
  HomeOutlined, UserAddOutlined, LoginOutlined, 
  LogoutOutlined, UserOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';

const { Text } = Typography;

interface UserData {
  userName: string;
  email: string;
  avatarUrl: string | null;
}

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const response = await api.get('/Auth/get-user');
      setUserData(response.data);
    } catch (error) {
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!userData && (location.pathname === '/' || location.pathname === '/profile')) {
       loadProfile();
    }
  }, [location.pathname, userData]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/Auth/logout', { refreshToken });
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('refreshToken');
      setUserData(null);
      navigate('/login');
    }
  };

  const isAuth = !!userData;

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 h-screen bg-[#001529] flex flex-col shadow-xl"
    >
      <div className="p-6 text-xl font-bold text-blue-400 italic">
        CRYPTO<span className="text-white">ANALYZER</span>
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        items={[
          ...(!isAuth && !loading ? [
            { key: '/register', icon: <UserAddOutlined />, label: 'Реєстрація' },
            { key: '/login', icon: <LoginOutlined />, label: 'Вхід' },
          ] : [{ key: '/', icon: <HomeOutlined />, label: 'Головна' }]),
        ]}
      />

      <div className="mt-auto p-4 border-t border-gray-800 bg-[#001020] min-h-[110px] flex flex-col justify-center">
        {loading ? (
          <div className="flex justify-center"><Spin size="small" /></div>
        ) : isAuth ? (
          <div className="flex flex-col gap-4">
            <div 
              className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-white/5 rounded-lg transition-all"
              onClick={() => navigate('/profile')}
            >
              <Avatar 
                src={userData.avatarUrl} 
                icon={<UserOutlined />} 
                className="bg-blue-600 border border-blue-400 flex-shrink-0" 
                size="large"
              />
              <div className="flex flex-col overflow-hidden">
                <Text className="text-white text-sm font-semibold truncate">
                  {userData.userName}
                </Text>
              </div>
            </div>

            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={handleLogout} 
              className="w-full text-left flex items-center gap-2 hover:bg-red-950/30 text-red-400"
            >
              Вийти
            </Button>
          </div>
        ) : (
          <div/>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;