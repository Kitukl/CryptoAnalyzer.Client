import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; 

const { Title, Text } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const payload = {
        loginRequest: {
          email: values.email,
          password: values.password
        }
      };

      const response = await api.post('/Auth/login', payload);

      if (response.status === 200) {
        const { refreshToken } = response.data;

        // 1. Зберігаємо рефреш-токен
        localStorage.setItem('refreshToken', refreshToken);
        
        // 2. Сигналізуємо Sidebar та іншим компонентам про оновлення
        window.dispatchEvent(new Event("storage"));
        
        message.success('Вхід успішний!');
        
        // 3. Переходимо на головну (без перезавантаження сторінки)
        navigate('/');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data || 'Помилка авторизації';
      message.error(errorMsg);
      
      form.setFields([{
        name: 'password',
        errors: [errorMsg]
      }]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center items-center py-10"
    >
      <Card className="w-full max-w-lg shadow-2xl bg-[#141414] border-gray-800" bordered={false}>
        <div className="text-center mb-8">
          <Title level={2} style={{ color: '#60a5fa' }}>Вхід у систему</Title>
          <Text type="secondary">З поверненням! Увійдіть, щоб продовжити аналіз</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="Електронна пошта"
            name="email"
            rules={[{ required: true, message: 'Введіть email!' }, { type: 'email' }]}
          >
            <Input prefix={<MailOutlined className="text-gray-500" />} placeholder="example@mail.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Введіть пароль!' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-500" />} placeholder="********" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block className="bg-blue-600 font-semibold">
              Увійти
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text className="text-gray-400">Ще не маєте акаунту? </Text>
          <Link to="/register" className="text-blue-500 font-medium">Зареєструватися</Link>
        </div>
      </Card>
    </motion.div>
  );
};

export default LoginPage;