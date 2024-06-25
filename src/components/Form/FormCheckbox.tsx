import { FC } from 'react';
import { Form, Checkbox } from 'antd';
import { FormCheckboxProps } from './ts-config';

const FormCheckbox: FC<FormCheckboxProps> = ({
  label,
  name,
  rules = [],
  noStyle = false,
  initialValue = '',
  formItemConfig,
  config,
  // 以下为checkbox特有参数
  options = [],
  onChange
}) => {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      noStyle={noStyle}
      initialValue={initialValue}
      {...formItemConfig}>
      <Checkbox.Group
        { ...config }
        options={options}
        onChange={(e) => onChange && onChange(e)}>
      </Checkbox.Group>
    </Form.Item>
  );
};

export default FormCheckbox;
