import { FC } from 'react';
import { Form, TreeSelect } from 'antd';
import { FormTreeSelectProps } from './ts-config';

const FormTreeSelect: FC<FormTreeSelectProps> = ({
  label,
  name,
  rules,
  placeholder = '请选择',
  treeData,
  onChange,
  formItemConfig = {},
  config = {}
}) => {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      {
        ...formItemConfig
      }
    >
      <TreeSelect
        placeholder={placeholder}
        onChange={(value, label, extra) => onChange && onChange(value, label, extra)}
        treeData={treeData}
        {
          ...config
        }
      />
    </Form.Item>
  );
};

export default FormTreeSelect;
