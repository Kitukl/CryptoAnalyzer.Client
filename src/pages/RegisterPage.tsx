import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Імпортуємо без фігурних дужок

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      // Формуємо об'єкт точно під твій Backend (registerRequest)
      const payload = {
        registerRequest: {
          username: values.username,
          email: values.email,
          password: values.password,
        },
      };

      const response = await api.post('/Auth/register', payload);

      if (response.status === 200) {
        message.success('Реєстрація успішна! Перевірте пошту для підтвердження.');
        navigate('/login');
      }
    } catch (error: any) {
      // Обробка помилок від сервера
      const serverMessage = error.response?.data?.error || 'Помилка з’єднання з сервером';
      message.error(serverMessage);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex justify-center items-center py-10"
    >
      <Card className="w-full max-w-lg shadow-2xl bg-[#141414] border-gray-800" bordered={false}>
        <div className="text-center mb-8">
          <Title level={2} style={{ color: '#60a5fa', marginBottom: '8px' }}>Створити акаунт</Title>
          <Text type="secondary">Приєднуйтесь до CryptoAnalyzer</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="Ім'я користувача"
            name="username"
            rules={[{ required: true, message: 'Будь ласка, введіть ім’я!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="oleg_crypto" size="large" />
          </Form.Item>

          <Form.Item
            label="Електронна пошта"
            name="email"
            rules={[
              { required: true, message: 'Введіть email!' },
              { 
                type: 'email', 
                message: 'Некоректний формат! Приклад: name@mail.com' 
              }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@mail.com" size="large" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Form.Item
              label="Пароль"
              name="password"
              rules={[
                { required: true, message: 'Введіть пароль!' },
                { min: 6, message: 'Мінімум 6 символів!' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="********" size="large" />
            </Form.Item>

            <Form.Item
              label="Підтвердження"
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Підтвердіть пароль!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Паролі не збігаються!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="********" size="large" />
            </Form.Item>
          </div>

          <Button type="primary" htmlType="submit" size="large" block className="bg-blue-600 h-12 mt-4 font-semibold">
            Зареєструватися
          </Button>
        </Form>

        <Divider style={{ borderColor: '#303030' }}><Text type="secondary">АБО</Text></Divider>

        <div className="text-center">
          <Text className="text-gray-400">Вже маєте акаунт? </Text>
          <Link to="/login" className="text-blue-400 hover:text-blue-300">Увійти</Link>
        </div>
      </Card>
    </motion.div>
  );
};

export default RegisterPage;