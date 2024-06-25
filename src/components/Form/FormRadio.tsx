import { FC } from 'react';
import { Form, Radio } from 'antd';

const FormRadio: FC<any> = ({
  label,
  name,
  initialValue = '',
  rules = [],
  options = [],
  optionType = 'default',
  formItemConfig = {},
  config = {},
  onChange
}) => {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      initialValue={initialValue}
      {...formItemConfig}>
      <Radio.Group
        options={options}
        optionType={optionType}
        {...config}
        onChange={(e) => onChange && onChange(e)}>
      </Radio.Group>
    </Form.Item>
  );
};

export default FormRadio;
