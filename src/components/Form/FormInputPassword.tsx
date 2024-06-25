import { FC } from 'react';
import { Form, Input } from 'antd';
import { FormInputPasswordProps } from './ts-config';

const FormInputPassword: FC<FormInputPasswordProps> = ({
  label,
  name,
  rules,
  placeholder = `请输入${label || ''}`,
  prefix,
  formItemConfig = {},
  config = {},
}) => {
  return (
    <Form.Item name={name} label={label} rules={rules} {...formItemConfig}>
      <Input.Password placeholder={placeholder} prefix={prefix} {...config} />
    </Form.Item>
  );
};

export default FormInputPassword;
