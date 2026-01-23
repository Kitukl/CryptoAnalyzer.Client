import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, InputNumber, Select, Spin, message } from 'antd';
import { DollarOutlined, BoxPlotOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import api from '../api/axios';
import axios from 'axios'

interface CreateHoldingModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateHoldingModal: React.FC<CreateHoldingModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [coins, setCoins] = useState<string[]>([]); // Змінено на string[]
  const [loadingCoins, setLoadingCoins] = useState(false);

  const fetchCoins = async (query = '') => {
    setLoadingCoins(true);
    try {      
      const res = await axios.get(`http://localhost:5094/api/Coins`);
      
      // 2. Обробка результату: 
      // Якщо прийшов масив (список всіх) — використовуємо як є.
      // Якщо прийшов один рядок або об'єкт (пошук) — кладемо в масив.
      let data = res.data;
      if (data && !Array.isArray(data)) {
        data = [data];
      }
      
      setCoins(data || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCoins([]); // Монету не знайдено — чистимо список
      } else {
        message.error("Помилка завантаження монет");
      }
    } finally {
      setLoadingCoins(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((nextValue: string) => fetchCoins(nextValue), 500),
    []
  );

  useEffect(() => {
    if (visible) {
      fetchCoins();
    }
  }, [visible]);

  const onSearch = (value: string) => {
    debouncedSearch(value);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await axios.post('http://localhost:5094/api/Holdings', {
        coinName: values.coinName,
        averagePrice: values.averagePrice,
        buyingPrice: values.buyingPrice
      });

      message.success("Холдинг створено успішно");
      form.resetFields();
      onSuccess();
    } catch (err) {
      message.error("Помилка при створенні холдингу");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={<span className="text-white">Додати новий актив</span>}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="Створити"
      cancelText="Скасувати"
      centered
      styles={{
        mask: { backdropFilter: 'blur(4px)' }
      }}
      modalRender={(modal) => (
        <div className="dark-theme-modal-wrapper">{modal}</div>
      )}
    >
      <Form form={form} layout="vertical" className="pt-4">
        <Form.Item
          name="coinName"
          label={<span className="text-gray-400">Монета</span>}
          rules={[{ required: true, message: 'Будь ласка, виберіть монету' }]}
        >
          <Select
            showSearch
            placeholder="Введіть назву монети (напр. bitcoin)"
            filterOption={false}
            onSearch={onSearch}
            loading={loadingCoins}
            className="w-full"
            notFoundContent={loadingCoins ? <Spin size="small" /> : "Монет не знайдено"}
          >
            {coins.map((coinName, index) => (
              <Select.Option key={`${coinName}-${index}`} value={coinName}>
                <span className="text-white">{coinName}</span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="averagePrice"
          label={<span className="text-gray-400">Середня ціна ($)</span>}
          rules={[{ required: true, message: 'Введіть ціну' }]}
        >
          <InputNumber 
            className="w-full bg-[#1c1c1c] border-gray-700 text-white rounded-xl h-11 flex items-center" 
            prefix={<DollarOutlined className="text-blue-500" />}
            min={0}
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item
          name="buyingPrice"
          label={<span className="text-gray-400">Ціна покупки ($)</span>}
          rules={[{ required: true, message: 'Введіть ціну покупки' }]}
        >
          <InputNumber 
            className="w-full bg-[#1c1c1c] border-gray-700 text-white rounded-xl h-11 flex items-center" 
            prefix={<BoxPlotOutlined className="text-indigo-500" />}
            min={0}
            placeholder="0.00"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateHoldingModal;