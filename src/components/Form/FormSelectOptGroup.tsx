/* 分组选择 */
import React from 'react';
import { Form, Select } from 'antd';
import { FormSelectOptGroupProps } from './ts-config';
const { Option, OptGroup } = Select;

const FormSelectOptGroup: React.FC<FormSelectOptGroupProps> = ({
  label,
  name,
  rules,
  options,
  placeholder = '请选择',
  allowClear = false,
  mode,
  formItemConfig,
  config,
}) => {
  return (
    <Form.Item name={name} label={label} rules={rules} {...formItemConfig}>
      <Select mode={mode} placeholder={placeholder} allowClear={allowClear} {...config}>
        {!!options.length &&
          options.map((item) => (
            <OptGroup key={item.label} label={item.label}>
              {!!item.children &&
                !!item.children.length &&
                item.children.map((child) => (
                  <Option key={child.value} value={child.value}>
                    {child.label}
                  </Option>
                ))}
            </OptGroup>
          ))}
      </Select>
    </Form.Item>
  );
};

export default FormSelectOptGroup;
