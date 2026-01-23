import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, InputNumber, Select, Spin, message } from 'antd';
import { DollarOutlined, BoxPlotOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import axios from 'axios';

interface CreateHoldingModalProps {
  visible: boolean;
  initialData?: any; // Дані для редагування
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateHoldingModal: React.FC<CreateHoldingModalProps> = ({ 
  visible, 
  initialData, 
  onCancel, 
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [coins, setCoins] = useState<any[]>([]); 
  const [loadingCoins, setLoadingCoins] = useState(false);

  const isEditing = !!initialData;

  // Завантаження списку монет для вибору
  const fetchCoins = async () => {
    setLoadingCoins(true);
    try {      
      const res = await axios.get(`http://localhost:5094/api/Coins`);
      let data = res.data;
      if (data && !Array.isArray(data)) data = [data];
      setCoins(data || []);
    } catch (err: any) {
      console.error("Помилка завантаження монет:", err);
    } finally {
      setLoadingCoins(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(() => fetchCoins(), 500),
    []
  );

  // Заповнення форми при редагуванні
  useEffect(() => {
    if (visible) {
      if (initialData) {
        form.setFieldsValue({
          // Мапимо дані з об'єкта холдингу у поля форми
          coinId: initialData.coinId, 
          quantity: initialData.quantity,
          pricePerUnit: initialData.pricePerUnit
        });
      } else {
        form.resetFields();
      }
      fetchCoins();
    }
  }, [visible, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // ВИПРАВЛЕНО: Ключі в об'єкті мають збігатися з UpdateHoldingCommand в C#
      const payload = {
        coinName: values.coinId,      // Мапимо вибраний ID у coinName для бекенда
        pricePerUnit: values.pricePerUnit,
        quantity: values.quantity
      };

      if (isEditing) {
        // PUT запит для оновлення
        await axios.put(`http://localhost:5094/api/Holdings/${initialData.id}`, payload);
        message.success("Актив оновлено");
      } else {
        // POST запит для створення (переконайся, що CreateHoldingCommand теж чекає такі назви)
        await axios.post('http://localhost:5094/api/Holdings', payload);
        message.success("Актив додано");
      }

      form.resetFields();
      onSuccess();
    } catch (err: any) {
      // Виводимо детальну помилку з сервера, якщо вона є
      const errorMsg = err.response?.data?.errors?.CoinName?.[0] || "Помилка збереження";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={<span className="text-white">{isEditing ? 'Редагувати актив' : 'Додати новий актив'}</span>}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText={isEditing ? "Зберегти" : "Створити"}
      cancelText="Скасувати"
      centered
      styles={{ mask: { backdropFilter: 'blur(4px)' } }}
      modalRender={(modal) => (
        <div className="dark-theme-modal-wrapper">{modal}</div>
      )}
    >
      <Form form={form} layout="vertical" className="pt-4">
        <Form.Item
          name="coinId"
          label={<span className="text-gray-400">Монета</span>}
          rules={[{ required: true, message: 'Будь ласка, виберіть монету' }]}
        >
          <Select
            showSearch
            placeholder="Оберіть монету"
            loading={loadingCoins}
            className="w-full"
            filterOption={(input, option) =>
              (option?.value?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {coins.map((coin, index) => {
              const id = typeof coin === 'string' ? coin : coin.id;
              const label = typeof coin === 'string' ? coin : (coin.name || coin.id);
              return (
                <Select.Option key={`${id}-${index}`} value={id}>
                  <span className="text-white">{label.toUpperCase()}</span>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item
          name="pricePerUnit"
          label={<span className="text-gray-400">Ціна за 1 одиницю ($)</span>}
          rules={[{ required: true, message: 'Введіть ціну закупівлі' }]}
        >
          <InputNumber 
            className="w-full bg-[#1c1c1c] border-gray-700 text-white rounded-xl h-11 flex items-center" 
            prefix={<DollarOutlined className="text-blue-500" />}
            min={0}
            precision={6}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label={<span className="text-gray-400">Кількість монет</span>}
          rules={[{ required: true, message: 'Введіть кількість' }]}
        >
          <InputNumber 
            className="w-full bg-[#1c1c1c] border-gray-700 text-white rounded-xl h-11 flex items-center" 
            prefix={<BoxPlotOutlined className="text-indigo-500" />}
            min={0}
            precision={8}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateHoldingModal;