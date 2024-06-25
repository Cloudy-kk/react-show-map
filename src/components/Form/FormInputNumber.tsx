import { FC } from 'react';
import { Form, InputNumber } from 'antd';
import { FormInputNumberProps } from './ts-config';

const FormInputNumber: FC<FormInputNumberProps> = ({
  label,
  name,
  rules = [],
  placeholder = `请输入${label || ''}`,
  max,
  min,
  formItemConfig = {},
  config = {},
}) => {
  return (
    <Form.Item name={name} label={label} rules={rules} {...formItemConfig}>
      <InputNumber placeholder={placeholder} min={min} max={max} {...config} />
    </Form.Item>
  );
};

export default FormInputNumber;
