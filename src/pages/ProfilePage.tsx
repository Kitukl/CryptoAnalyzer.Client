import { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Button, Input, Spin, message, Upload, Tag, Space } from 'antd';
import { 
  UserOutlined, MailOutlined, CameraOutlined, 
  SaveOutlined, EditOutlined, CloseOutlined,
  CheckCircleFilled, EyeOutlined, EyeInvisibleOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import CreateHoldingModal from '../components/CreateComponentModal'
import axios from 'axios'

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showFullEmail, setShowFullEmail] = useState(false);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [isHoldingModalVisible, setIsHoldingModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/Auth/get-user');
      setUser(res.data);
      setUserName(res.data.userName);
      setEmail(res.data.email);
      setAvatarFile(null);
      setPreviewUrl(null);
    } catch (err) {
      message.error("Помилка завантаження даних");
    } finally {
      setLoading(false);
    }
  };

  const fetchHoldings = async () => {
    try {
      const res = await axios.get('http://localhost:5094/api/Holdings');
      setHoldings(res.data);
    } catch (err) {
      console.error("Помилка завантаження холдингів");
    }
  };

  // Оновлюємо useEffect
  useEffect(() => {
    fetchProfile();
    fetchHoldings(); // Додаємо цей виклик
  }, []);

  const handleDeleteHolding = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5094/api/Holdings/${id}`);
      message.success("Актив видалено");
      fetchHoldings();
    } catch (err) {
      message.error("Не вдалося видалити актив");
    }
  };

  const maskEmail = (mail: string) => {
    if (!mail) return "";
    const [name, domain] = mail.split('@');
    if (name.length <= 3) return `***@${domain}`;
    return `${name.substring(0, 3)}***@${domain}`;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      formData.append('request.CurrentEmail', user.email);
      formData.append('request.UserName', userName);
      formData.append('request.NewEmail', email);
      
      if (avatarFile) {
        formData.append('request.AvatarUrl', avatarFile);
      }

      await api.put('/Auth', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success("Зміни успішно збережено");
      setIsEditing(false);
      await fetchProfile(); 
    } catch (err: any) {
      const errorText = err.response?.data?.Errors?.[0] || "Не вдалося зберегти зміни";
      message.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleBeforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Можна завантажувати лише JPG/PNG файли!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Зображення має бути меншим за 2MB!');
      return Upload.LIST_IGNORE;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    return false; 
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUserName(user?.userName);
    setEmail(user?.email);
    setAvatarFile(null);
    setPreviewUrl(null);
  };

  if (loading && !user) return (
    <div className="flex-1 flex justify-center items-center bg-[#0b0f1a]">
      <Spin size="large" tip="Завантаження профілю..." />
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-[#0b0f1a] p-6 md:p-12 overflow-y-auto relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto z-10 relative"
      >
        <Card 
          className="bg-[#141414]/90 backdrop-blur-md border-gray-800 shadow-2xl rounded-3xl overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <Button 
              className="absolute top-4 left-3 bg-black/30 border-none text-white hover:bg-black/50 backdrop-blur-md flex items-center justify-center"
              icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
              shape="circle"
              size="large"
            />
          </div>

          <div className="px-10 pb-10">
            <div className="relative h-20">
              <div className="absolute -top-16 left-0 md:left-0">
                <div className="relative group">
                   <Avatar 
                    size={130} 
                    src={previewUrl || user?.avatarUrl} 
                    icon={<UserOutlined style={{ color: '#ffffff' }} />} 
                    className="bg-blue-600 flex items-center justify-center border-4 border-[#141414] shadow-2xl"
                  />
                  {isEditing && (
                    <Upload 
                      showUploadList={false} 
                      beforeUpload={handleBeforeUpload}
                      className="absolute inset-0"
                    >
                      <div className="w-[130px] h-[130px] rounded-full bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <CameraOutlined className="text-white text-3xl" />
                      </div>
                    </Upload>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div 
                  key="view"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-8">
                    <Title level={1} className="!text-white !mb-1 !mt-2">{user?.userName}</Title>
                    
                    <Space size="middle" className="mb-4">
                      <Text className="text-blue-400 font-medium text-lg">
                        {showFullEmail ? user?.email : maskEmail(user?.email)}
                      </Text>
                      <Button 
                        type="text" 
                        icon={showFullEmail ? <EyeInvisibleOutlined /> : <EyeOutlined />} 
                        onClick={() => setShowFullEmail(!showFullEmail)}
                        className="text-gray-500 hover:text-blue-400 p-0 flex items-center justify-center"
                      />
                    </Space>

                    <div className="mt-2 flex gap-2">
                      <Tag icon={<CheckCircleFilled />} color="blue" className="rounded-full px-4 py-1 border-none bg-blue-500/20 text-blue-400">
                        Користувач
                      </Tag>
                      <Tag color="green" className="rounded-full px-4 py-1 border-none bg-green-500/20 text-green-400">
                        Верифікований
                      </Tag>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="edit"
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6 pt-4"
                >
                  <Title level={3} className="!text-white !mb-6">Налаштування профілю</Title>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Text className="text-gray-400 mb-2 block ml-1 font-semibold uppercase text-[10px] tracking-wider">Новий нікнейм</Text>
                      <Input 
                        size="large"
                        value={userName} 
                        onChange={e => setUserName(e.target.value)} 
                        prefix={<UserOutlined className="text-blue-500" />}
                        className="bg-[#1c1c1c] border-gray-700 text-white hover:border-blue-500 h-12 rounded-xl"
                      />
                    </div>
                    
                    <div>
                      <Text className="text-gray-400 mb-2 block ml-1 font-semibold uppercase text-[10px] tracking-wider">Електронна пошта</Text>
                      <Input 
                        size="large"
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        prefix={<MailOutlined className="text-blue-500" />}
                        className="bg-[#1c1c1c] border-gray-700 text-white hover:border-blue-500 h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      loading={loading}
                      icon={<SaveOutlined />} 
                      onClick={handleSave}
                      className="bg-blue-600 rounded-xl h-12 border-none shadow-lg shadow-blue-600/20"
                    >
                      Зберегти зміни
                    </Button>
                    <Button 
                      size="large" 
                      block 
                      onClick={handleCancel}
                      className="rounded-xl h-12 border-gray-700 bg-transparent text-gray-400 hover:text-white"
                    >
                      Скасувати
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
      <motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="max-w-3xl mx-auto z-10 relative mt-8"
>
  <div className="flex justify-between items-center mb-6 px-2">
    <Title level={3} className="!text-white !mb-0">Мої активи</Title>
    <Button 
      type="primary" 
      icon={<PlusOutlined />} 
      onClick={() => setIsHoldingModalVisible(true)}
      className="bg-blue-600 rounded-xl border-none"
    >
      Додати
    </Button>
  </div>

  <div className="grid grid-cols-1 gap-4">
    {holdings.length === 0 ? (
      <div className="bg-[#141414]/60 border border-dashed border-gray-800 rounded-3xl p-10 text-center">
        <Text className="text-gray-500">У вас поки немає доданих холдингів</Text>
      </div>
    ) : (
      holdings.map((holding) => (
        <Card 
          key={holding.id}
          className="bg-[#141414]/90 border-gray-800 rounded-2xl hover:border-blue-500/50 transition-colors"
          bodyStyle={{ padding: '16px 24px' }}
        >
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Text className="text-white font-bold text-lg block">
            {holding.coin?.name}
          </Text>
          <Tag className="bg-gray-800 border-none text-gray-400 rounded-md uppercase text-[10px]">
            {holding.coin?.symbol}
          </Tag>
        </div>
        
        <Space size="large" className="text-sm">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Середня ціна</span>
            <span className="text-blue-400 font-mono">${holding.averagePrice < 0.01 ? holding.averagePrice.toFixed(8) : holding.averagePrice.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Поточна ціна</span>
            <span className="text-blue-400 font-mono">${holding.currentPrice < 0.01 ? holding.currentPrice.toFixed(8) : holding.currentPrice.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Прибуток</span>
            <span className={`font-mono font-bold ${holding.currentProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {holding.currentProfit >= 0 ? '+' : ''}{holding.currentProfit?.toFixed(2)}%
            </span>
          </div>
        </Space>
      </div>
      
      <Button 
        type="text" 
        danger 
        icon={<DeleteOutlined />} 
        onClick={() => handleDeleteHolding(holding.id)}
        className="hover:bg-red-500/10 rounded-lg ml-4"
      />
    </div>
  </Card>
)))}
  </div>
</motion.div>

{/* Модалка створення */}
<CreateHoldingModal 
  visible={isHoldingModalVisible}
  onCancel={() => setIsHoldingModalVisible(false)}
  onSuccess={() => {
    setIsHoldingModalVisible(false);
    fetchHoldings();
  }}
/>
    </div>
  );
};

export default ProfilePage;