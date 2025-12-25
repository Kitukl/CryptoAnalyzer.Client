import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, message } from 'antd';
import api from '../api/axios';

const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  // Реф, щоб запобігти подвійному виклику в StrictMode
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const confirmEmail = async () => {
      const userId = searchParams.get('userId');
      const token = searchParams.get('token');

      if (!userId || !token) {
        setStatus('error');
        setErrorMessage('Відсутні дані для підтвердження (userId або token).');
        return;
      }

      try {
        await api.post('/Auth/confirm-email', {
          request: { userID: userId, token: token }
        });
        setStatus('success');
        message.success('Пошту успішно підтверджено!');
      } catch (err: any) {
        // Якщо це помилка паралельного запиту, але пошта вже підтверджена
        if (err.response?.data?.includes("object has been modified")) {
           setStatus('success'); 
           return;
        }

        setStatus('error');
        const errorText = err.response?.data || err.message || 'Невідома помилка';
        setErrorMessage(errorText);
        message.error(`Помилка: ${errorText}`);
      }
    };

    confirmEmail();
  }, [searchParams]);

  if (status === 'loading') {
    return <div className="flex justify-center mt-40"><Spin size="large" tip="Підтверджуємо..." /></div>;
  }

  return (
    <div className="flex justify-center mt-20">
      {status === 'success' ? (
        <Result
          status="success"
          title="Готово!"
          subTitle="Вашу електронну пошту підтверджено. Тепер ви можете увійти."
          extra={<Button type="primary" onClick={() => navigate('/login')}>Увійти</Button>}
        />
      ) : (
        <Result
          status="error"
          title="Не вдалося підтвердити пошту"
          subTitle={errorMessage} // Виводимо конкретну помилку тут
          extra={<Button onClick={() => navigate('/register')}>До реєстрації</Button>}
        />
      )}
    </div>
  );
};

export default ConfirmEmailPage;