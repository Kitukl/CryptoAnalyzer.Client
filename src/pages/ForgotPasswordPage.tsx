import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Statistic, message, Space } from 'antd';
import { MailOutlined, LockOutlined, KeyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [deadline, setDeadline] = useState(0);
  const navigate = useNavigate();

  // Запит на отримання коду
  const handleSendCode = async (values: { email: string }) => {
    setLoading(true);
    try {
      await api.post('/Auth/forgot-password', { email: values.email });
      setEmail(values.email);
      setDeadline(Date.now() + 1000 * 60 * 5); // Таймер на 5 хвилин
      setStep(2);
      message.success('Код відновлення надіслано на вашу пошту!');
    } catch (error: any) {
      message.error(error.response?.data || 'Помилка при відправці запиту');
    } finally {
      setLoading(false);
    }
  };

  // Скидання пароля з кодом
  const handleResetPassword = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ressetPassword: {
          email: email,
          code: values.code,
          newPassword: values.newPassword
        }
      };
      await api.post('/Auth/reset-password', payload);
      message.success('Пароль успішно змінено! Тепер ви можете увійти.');
      navigate('/login');
    } catch (error: any) {
      message.error(error.response?.data || 'Невірний код або помилка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10">
      <Card className="w-full max-w-lg shadow-2xl bg-[#141414] border-gray-800" bordered={false}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-8">
                <Title level={2} style={{ color: '#60a5fa' }}>Забули пароль?</Title>
                <Text type="secondary">Введіть ваш Email, щоб отримати код для відновлення</Text>
              </div>

              <Form layout="vertical" onFinish={handleSendCode}>
                <Form.Item
                  name="email"
                  label="Електронна пошта"
                  rules={[{ required: true, type: 'email', message: 'Введіть коректний email!' }]}
                >
                  <Input prefix={<MailOutlined />} size="large" placeholder="example@mail.com" />
                </Form.Item>

                <Button type="primary" htmlType="submit" block size="large" loading={loading} className="bg-blue-600 h-12">
                  Надіслати код
                </Button>
                
                <div className="text-center mt-6">
                  <Link to="/login" className="text-gray-400 hover:text-blue-400">
                    <ArrowLeftOutlined /> Повернутися до входу
                  </Link>
                </div>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <Title level={2} style={{ color: '#60a5fa' }}>Скидання пароля</Title>
                <Text type="secondary">Ми відправили 6-значний код на <br/> <b>{email}</b></Text>
              </div>

              <Form layout="vertical" onFinish={handleResetPassword}>
                <Form.Item
                  name="code"
                  label="Код підтвердження"
                  rules={[{ required: true, message: 'Введіть код!' }]}
                >
                  <Input.OTP length={6} size="large" className="justify-center" />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="Новий пароль"
                  rules={[{ required: true, min: 6, message: 'Мінімум 6 символів!' }]}
                >
                  <Input.Password prefix={<LockOutlined />} size="large" placeholder="Новий пароль" />
                </Form.Item>

                <Form.Item
                  name="confirm"
                  label="Підтвердження"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Підтвердіть пароль!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                        return Promise.reject(new Error('Паролі не збігаються!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} size="large" placeholder="Повторіть пароль" />
                </Form.Item>

                <div className="flex justify-between items-center mb-6 px-1">
                  <Text type="secondary">Код дійсний:</Text>
                  <Countdown value={deadline} format="mm:ss" valueStyle={{ color: '#faad14', fontSize: '16px' }} />
                </div>

                <Button type="primary" htmlType="submit" block size="large" loading={loading} className="bg-blue-600 h-12 font-semibold">
                  Змінити пароль
                </Button>

                <Button type="link" block className="mt-2 text-gray-500" onClick={() => setStep(1)}>
                  Змінити Email
                </Button>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;