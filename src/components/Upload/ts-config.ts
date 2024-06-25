import { UploadProps } from 'antd/lib/upload/interface';

export interface CombineUploadProps extends UploadProps {
  size?: number; // 上传大小限制
  fileType?: string[]; // 上传类型
  qiniuParams?: {
    domain: string;
    bucket: string;
  };
  isPreviewImage?: boolean; // 是否预览图片(弹窗预览)&默认为false
  [p: string]: any;
  showSuccessMessage?: boolean; // 是否显示文件上传成功提示，默认为true
  width?: number;
  height?: number;
}
