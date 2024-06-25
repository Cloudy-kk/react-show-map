import { FC } from 'react';
import { Form, DatePicker } from 'antd';
import IconFont from '@/common/components/IconFont';
import { FormRangePickerProps } from './ts-config';

const { RangePicker } = DatePicker;

const FormRangePicker: FC<FormRangePickerProps> = ({
  label,
  name,
  rules,
  noStyle = false,
  formItemConfig,
  config,
  ...props
}) => {
  return (
    <Form.Item noStyle={noStyle} name={name} label={label} rules={rules} {...formItemConfig}>
      <RangePicker {...config} {...props} suffixIcon={<IconFont iconHref='icon-riqi' />} />
    </Form.Item>
  );
};

export default FormRangePicker;
