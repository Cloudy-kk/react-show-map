import { UploadProps } from 'antd/lib/upload/interface';
import { ReactNode } from 'react';

export interface CombineUploadProps extends UploadProps {
  /**
   * @description 是否插入qiniu云下载所需要的 attname 参数，插入后，只要是qiniu云的链接，都会仅下载而不预览。 仅files和dragger类型下有效
   * @default false
   */
  setAttName?: boolean;
  /**
   * @description 变化时回调函数
   */
  onCustomChange?: Function;
  /**
   * @description 上传文件大小，单位为M
   */
  size?: number;
  /**
   * @description 上传文件图片宽度，单位px
   */
  width?: number;
  /**
   * @description 上传文件图片高度，单位px
   */
  height?: number;
  /**
   * @description 最多上传文件数量，maxCount为1时后面上传的会覆盖前面上传的
   */
  maxCount?: number;
  /**
   * @description 是否可以多选文件
   */
  multiple?: boolean;
  /**
   * @description 上传文件类型，取文件后缀名
   */
  fileType?: string[] | string;
  /**
   * @description 是否需要图片预览，会在上传文件为图片类型时调用图片预览，否则采取默认的预览方式-打开新页面链接
   */
  isPreviewImage?: boolean; // 是否预览图片(弹窗预览)&默认为false
  /**
   * @description 是否显示文件上传成功提示，默认为true
   */
  showSuccessMessage?: boolean;
  /**
   * @description 七牛上传默认文件，默认为证件文件
   */
  qiniuParams?: {
    domain: string;
    bucket: string;
  };
  /**
   * @description 是否可以拖拽排序
   */
  useDragItem?: boolean;
}

export interface TipConfigProps {
  /**
   * @description 是否显示提示
   */
  show?: boolean;
  /**
   * @description 提示弹窗显示的内容
   */
  tooltipTitle?: ReactNode;
  /**
   * @description 提示触发的icon
   */
  tooltipIcon?: ReactNode;
  /**
   * @description 是否显示提示触发的icon
   */
  tooltipIconShow?: boolean;
  /**
   * @description 自定义的提示二级标题
   */
  tooltipText?: string;
  /**
   * @description 类型名称
   */
  typeText?: string;
}
