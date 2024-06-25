import { FC } from 'react';
import { Form, Input } from 'antd';
import { FormTextAreaProps } from './ts-config';

const { TextArea } = Input;

const FormTextArea: FC<FormTextAreaProps> = ({
  label,
  name,
  rules,
  placeholder = `请输入${label || ''}`,
  maxLength,
  noStyle = false,
  rows = 3,
  allowClear = false,
  formItemConfig,
  config,
}) => {
  return (
    <Form.Item noStyle={noStyle} name={name} label={label} rules={rules} {...formItemConfig}>
      <TextArea allowClear={allowClear} rows={rows} placeholder={placeholder} maxLength={maxLength} {...config} />
    </Form.Item>
  );
};

export default FormTextArea;
