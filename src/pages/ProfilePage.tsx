import { useEffect, useState, useMemo } from 'react';
import { Card, Avatar, Typography, Button, Input, Spin, message, Upload, Tag, Space, Pagination } from 'antd';
import { 
  UserOutlined, MailOutlined, CameraOutlined, 
  SaveOutlined, EditOutlined, CloseOutlined,
  CheckCircleFilled, EyeOutlined, EyeInvisibleOutlined,
  PlusOutlined, DeleteOutlined, SearchOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import CreateHoldingModal from '../components/CreateComponentModal';
import axios from 'axios';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showFullEmail, setShowFullEmail] = useState(false);
  
  // Холдинги та фільтрація
  const [holdings, setHoldings] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Модалка
  const [isHoldingModalVisible, setIsHoldingModalVisible] = useState(false);
  const [editingHolding, setEditingHolding] = useState<any>(null);

  // Профільні дані
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchHoldings();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/Auth/get-user');
      setUser(res.data);
      setUserName(res.data.userName);
      setEmail(res.data.email);
    } catch (err) {
      message.error("Помилка завантаження профілю");
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

  // --- ЛОГІКА ПОШУКУ ТА ПАГІНАЦІЇ ---
  const filteredHoldings = useMemo(() => {
    return holdings.filter(h => 
      h.coin?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      h.coin?.symbol?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [holdings, searchText]);

  const pagedHoldings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHoldings.slice(start, start + pageSize);
  }, [filteredHoldings, currentPage]);

  // --- ФУНКЦІЇ ДІЙ ---
  const handleEditClick = (holding: any) => {
    setEditingHolding(holding);
    setIsHoldingModalVisible(true);
  };

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
      if (avatarFile) formData.append('request.AvatarUrl', avatarFile);

      await api.put('/Auth', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success("Профіль оновлено");
      setIsEditing(false);
      await fetchProfile(); 
    } catch (err: any) {
      message.error("Помилка оновлення");
    } finally {
      setLoading(false);
    }
  };

  const handleBeforeUpload = (file: File) => {
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    return false; 
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUserName(user?.userName);
    setEmail(user?.email);
    setPreviewUrl(null);
  };

  if (loading && !user) return (
    <div className="flex-1 flex justify-center items-center bg-[#0b0f1a]">
      <Spin size="large" tip="Завантаження..." />
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-[#0b0f1a] p-6 md:p-12 overflow-y-auto relative">
      {/* Декоративні блюри */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* КАРТКА ПРОФІЛЮ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto z-10 relative">
        <Card className="bg-[#141414]/90 backdrop-blur-md border-gray-800 shadow-2xl rounded-3xl overflow-hidden" bodyStyle={{ padding: 0 }}>
          <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <Button 
              className="absolute top-4 left-3 bg-black/30 border-none text-white hover:bg-black/50 backdrop-blur-md"
              icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
              shape="circle" size="large"
            />
          </div>

          <div className="px-10 pb-10">
            <div className="relative h-20">
              <div className="absolute -top-16 left-0">
                <div className="relative group">
                   <Avatar 
                    size={130} src={previewUrl || user?.avatarUrl} 
                    icon={<UserOutlined style={{ color: '#ffffff' }} />} 
                    className="bg-blue-600 border-4 border-[#141414] shadow-2xl"
                  />
                  {isEditing && (
                    <Upload showUploadList={false} beforeUpload={handleBeforeUpload} className="absolute inset-0">
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
                <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-8">
                    <Title level={1} className="!text-white !mb-1 !mt-2">{user?.userName}</Title>
                    <Space size="middle" className="mb-4">
                      <Text className="text-blue-400 font-medium text-lg">
                        {showFullEmail ? user?.email : maskEmail(user?.email)}
                      </Text>
                      <Button type="text" icon={showFullEmail ? <EyeInvisibleOutlined /> : <EyeOutlined />} 
                        onClick={() => setShowFullEmail(!showFullEmail)} className="text-gray-500 p-0" />
                    </Space>
                    <div className="mt-2 flex gap-2">
                      <Tag icon={<CheckCircleFilled />} color="blue" className="rounded-full px-4 py-1 border-none bg-blue-500/20 text-blue-400">Користувач</Tag>
                      <Tag color="green" className="rounded-full px-4 py-1 border-none bg-green-500/20 text-green-400">Верифікований</Tag>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-4">
                  <Title level={3} className="!text-white !mb-6">Налаштування</Title>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Text className="text-gray-400 mb-2 block text-[10px] uppercase font-bold tracking-wider">Нікнейм</Text>
                      <Input size="large" value={userName} onChange={e => setUserName(e.target.value)} 
                        prefix={<UserOutlined className="text-blue-500" />} className="bg-[#1c1c1c] border-gray-700 text-white rounded-xl h-12" />
                    </div>
                    <div>
                      <Text className="text-gray-400 mb-2 block text-[10px] uppercase font-bold tracking-wider">Пошта</Text>
                      <Input size="large" value={email} onChange={e => setEmail(e.target.value)} 
                        prefix={<MailOutlined className="text-blue-500" />} className="bg-[#1c1c1c] border-gray-700 text-white rounded-xl h-12" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <Button type="primary" size="large" block loading={loading} icon={<SaveOutlined />} onClick={handleSave} className="bg-blue-600 rounded-xl h-12 border-none">Зберегти</Button>
                    <Button size="large" block onClick={handleCancel} className="rounded-xl h-12 border-gray-700 bg-transparent text-gray-400 hover:text-white">Скасувати</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* СЕКЦІЯ ХОЛДИНГІВ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto z-10 relative mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-2 gap-4">
          <Title level={3} className="!text-white !mb-0">Мої активи</Title>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Input 
              placeholder="Пошук монети..." 
              prefix={<SearchOutlined className="text-gray-500" />}
              className="bg-[#141414] border-gray-800 text-white rounded-xl w-full md:w-64"
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1); // Скидаємо на першу сторінку при пошуку
              }}
            />
            <Button 
              type="primary" icon={<PlusOutlined />} 
              onClick={() => {
                setEditingHolding(null);
                setIsHoldingModalVisible(true);
              }} 
              className="bg-blue-600 rounded-xl border-none min-w-[100px]"
            >
              Додати
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 min-h-[400px] content-start">
          {filteredHoldings.length === 0 ? (
            <div className="bg-[#141414]/60 border border-dashed border-gray-800 rounded-3xl p-10 text-center">
              <Text className="text-gray-500">Активи не знайдені</Text>
            </div>
          ) : (
            pagedHoldings.map((holding) => (
              <Card 
                key={holding.id}
                className="bg-[#141414]/90 border-gray-800 rounded-2xl hover:border-blue-500/50 transition-colors"
                bodyStyle={{ padding: '16px 24px' }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Text className="text-white font-bold text-lg">{holding.coin?.name}</Text>
                      <Tag className="bg-gray-800 border-none text-gray-400 rounded-md uppercase text-[10px]">{holding.coin?.symbol}</Tag>
                    </div>
                    
                    <Space size="large" className="text-sm flex-wrap">
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Вкладено</span>
                        <span className="text-blue-400 font-mono">{holding.quantity.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Ціна закупки</span>
                        <span className="text-blue-400 font-mono">${holding.pricePerUnit < 0.01 ? holding.pricePerUnit.toFixed(6) : holding.pricePerUnit.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Поточна ціна</span>
                        <span className="text-blue-400 font-mono">${holding.currentPrice < 0.01 ? holding.currentPrice.toFixed(6) : holding.currentPrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">Профіт</span>
                        <span className={`font-mono font-bold ${holding.currentProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {holding.currentProfit >= 0 ? '+' : ''}{holding.currentProfit?.toFixed(2)}%
                        </span>
                      </div>
                    </Space>
                  </div>
                  
                  <Space>
                    <Button 
                      type="text" 
                      icon={<EditOutlined className="text-blue-400" />} 
                      onClick={() => handleEditClick(holding)}
                      className="hover:bg-blue-500/10 rounded-lg"
                    />
                    <Button 
                      type="text" danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDeleteHolding(holding.id)}
                      className="hover:bg-red-500/10 rounded-lg"
                    />
                  </Space>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* ПАГІНАЦІЯ */}
        {filteredHoldings.length > pageSize && (
          <div className="flex justify-center mt-8">
            <Pagination 
              current={currentPage}
              pageSize={pageSize}
              total={filteredHoldings.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              className="custom-pagination"
            />
          </div>
        )}
      </motion.div>

      {/* МОДАЛКА (Створення / Редагування) */}
      <CreateHoldingModal 
        visible={isHoldingModalVisible}
        initialData={editingHolding} // Передаємо дані для редагування
        onCancel={() => {
          setIsHoldingModalVisible(false);
          setEditingHolding(null);
        }}
        onSuccess={() => {
          setIsHoldingModalVisible(false);
          setEditingHolding(null);
          fetchHoldings();
        }}
      />

      {/* Стилі для пагінації (темна тема) */}
      <style>{`
        .custom-pagination .ant-pagination-item a { color: #6b7280; }
        .custom-pagination .ant-pagination-item-active { background: transparent; border-color: #2563eb; }
        .custom-pagination .ant-pagination-item-active a { color: #3b82f6 !important; }
        .custom-pagination .ant-pagination-prev button, .custom-pagination .ant-pagination-next button { color: #6b7280; }
      `}</style>
    </div>
  );
};

export default ProfilePage;