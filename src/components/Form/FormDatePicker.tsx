import { FC } from 'react';
import { Form, DatePicker } from 'antd';
import IconFont from '@/common/components/IconFont';

import { FormDatePickerProps } from './ts-config';

const FormDatePicker: FC<FormDatePickerProps> = ({
  label,
  name,
  rules,
  noStyle = false,
  placeholder,
  formItemConfig,
  config,
}) => {
  return (
    <Form.Item noStyle={noStyle} name={name} label={label} rules={rules} {...formItemConfig}>
      <DatePicker {...config} placeholder={placeholder} suffixIcon={<IconFont iconHref='icon-riqi' />} />
    </Form.Item>
  );
};

export default FormDatePicker;
