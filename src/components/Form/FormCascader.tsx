import { FC } from 'react';
import { Form, Cascader } from 'antd';
import { FormCascaderProps } from './ts-config';

const FormCascader: FC<FormCascaderProps> = ({
  label,
  name,
  rules,
  noStyle = false,
  options,
  placeholder = '请选择',
  formItemConfig,
  config,
}) => {
  return (
    <Form.Item noStyle={noStyle} name={name} label={label} rules={rules} {...formItemConfig}>
      <Cascader
        options={options}
        placeholder={placeholder}
        {...config} />
    </Form.Item>
  );
};

export default FormCascader;
