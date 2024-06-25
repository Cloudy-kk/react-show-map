/* form上传 */
import { FC } from 'react';
import { Form } from 'antd';
import Upload from '@/common/components/Upload';
import { FormUploadProps } from './ts-config';

const FormUpload: FC<FormUploadProps> = ({
  label,
  name,
  rules,
  noStyle = false,
  valuePropName = 'fileList',
  initialValue,
  config,
  formItemConfig = {},
  children,
}) => {
  return (
    <Form.Item
      noStyle={noStyle}
      name={name}
      label={label}
      rules={rules}
      valuePropName={valuePropName}
      initialValue={initialValue}
      {...formItemConfig}
    >
      <Upload {...config}>{children}</Upload>
    </Form.Item>
  );
};

export default FormUpload;
