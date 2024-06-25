import React from 'react';
import { Form, Select } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import { FormSelectProps } from './ts-config';

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  rules,
  options,
  placeholder = `请选择${label || ''}`,
  allowClear = false,
  mode,
  formItemConfig = {},
  config = {},
}) => {
  return (
    <Form.Item name={name} label={label} rules={rules} {...formItemConfig}>
      <Select
        mode={mode}
        options={options}
        placeholder={placeholder}
        allowClear={allowClear}
        removeIcon={<CloseCircleFilled style={{ color: '#B8BDC4' }} />}
        {...config}
      />
    </Form.Item>
  );
};

export default FormSelect;
