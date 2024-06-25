import { FormItemProps, FormProps } from 'antd/lib/form/index';
import { PasswordProps } from 'antd/lib/input/Password';
import { TextAreaProps } from 'antd/lib/input/TextArea.d';
import { SelectProps, SwitchProps } from 'antd/lib/index';
import { DatePickerProps, RangePickerProps } from 'antd/lib/date-picker';
import { InputProps } from 'antd/lib/input';
import { InputNumberProps } from 'antd/lib/input-number';
import { TreeSelectProps } from 'antd/lib/tree-select';
import { CascaderProps } from 'antd/lib/cascader/index';
import { ReactNode } from 'react';
import { CombineUploadProps } from '@/common/components/Upload/ts-config';
import { CheckboxGroupProps } from 'antd/lib/checkbox';

// Form.Item的默认参数 ，其他入参传入formItemConfig，对应Form.Item
export interface DefaultFormItemProps {
  name: string;
  label?: ReactNode;
  noStyle?: boolean;
  rules?: any[];
  formItemConfig?: FormItemProps; // Form.Item的其他入参
}

//  input输入框
export interface FormInputProps extends DefaultFormItemProps {
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  rules?: Array<any>;
  // inputStyle?: any;
  // readOnly?: boolean; // 是否只读
  onClickInput?: Function;
  prefix?: ReactNode;
  config?: InputProps;
  blur?: Function;
  removeSpace?: boolean; // 是否去前后的空格，默认为false
}

//  密码输入框
export interface FormInputPasswordProps extends DefaultFormItemProps {
  placeholder?: string;
  readOnly?: boolean;
  prefix?: ReactNode;
  dependencies?: string | number | (string | number)[];
  config?: PasswordProps; // antd input password的入参
}

// 数字输入框
export interface FormInputNumberProps extends DefaultFormItemProps {
  placeholder?: string;
  max?: number; // 最大
  min?: number; // 最小
  config?: InputNumberProps;
}

// 多行文本输入框
export interface FormTextAreaProps extends DefaultFormItemProps {
  placeholder?: string;
  rows?: number; // 行数
  showCount?: boolean; // 是否显示数量
  maxLength?: number; // 字数
  allowClear?: boolean; // 是否可以点击图标删除
  config?: TextAreaProps; // antd TextArea 的入参
}

// select框
export interface FormSelectProps extends DefaultFormItemProps {
  options: any[];
  placeholder?: string;
  allowClear?: boolean;
  mode?: 'multiple' | 'tags';
  config?: SelectProps;
}

// select组
export interface FormSelectOptGroupProps extends DefaultFormItemProps {
  valuePropName?: string;
  initialValue?: any;
  options: any[];
  placeholder?: string;
  allowClear?: boolean;
  mode?: 'multiple' | 'tags';
  config?: SelectProps; // antd Select 的入参
}

// treeSelect框
export interface FormTreeSelectProps extends DefaultFormItemProps {
  treeData: any[];
  placeholder?: string;
  onChange?: Function;
  config?: TreeSelectProps;
}

// switch开关
export interface FormSwitchProps extends DefaultFormItemProps {
  valuePropName?: string;
  initialValue?: any;
  config?: SwitchProps; // antd switch 的入参
}

// 时间选择
export interface FormDatePickerProps extends DefaultFormItemProps {
  placeholder?: string;
  config?: DatePickerProps; // antd DataPicker 的入参
}

// 上传
export interface FormUploadProps extends DefaultFormItemProps {
  valuePropName?: string;
  initialValue?: any;
  uploadRef?: any;
  config: CombineUploadProps;
}

// 级联选择
export interface FormCascaderProps extends DefaultFormItemProps {
  options: any[];
  placeholder?: string;
  config?: CascaderProps<any>; // antd Cascader 的入参
}

// 带搜索和重置按钮的form
export interface SearchFormProps extends FormProps {
  onSearch?: Function; // 确定
  className?: string;
  labelLength?: number;
  extra?: ReactNode; // 可传入额外的操作
  onRef?: any;
  onOkText?: string; // 查询按钮的问题-默认为查询
  onCustomerReset?: () => void; // 外部传入重置按钮操作
  hiddenOkBtn?: boolean; // 隐藏确定按钮，默认为false
  showResetBtn?: boolean; // 显示重置按钮，默认true
  showSearchNum?: number; // 显示搜索框数量
  /**
   * @description 可传入右侧按钮组
   */
  rightOperate?: ReactNode;
  isElastic?: Boolean; // 是否可展开折叠
  elasticRow?: number; // 默认显示的行数
  itemRowHeight?: number; // 行高
  moreBtn?: boolean; // 是否需要折叠功能
}

export interface FormRangePickerProps extends DefaultFormItemProps {
  config?: RangePickerProps; // antd RangerPicker 的入参
  disabledDate?: (date: any) => boolean;
}

// Checkbox
export interface FormCheckboxProps extends DefaultFormItemProps {
  initialValue?: any;
  options: any[];
  onChange?: Function;
  config?: CheckboxGroupProps; // antd checkbox group 的入参
}

// InputNumberRange
export interface FormInputNumberRangeProps extends DefaultFormItemProps {
  isRely?: boolean; // 默认为true-即要么都不填要么都填
  addonAfter?: string; // 默认为空 不显示
  max?: number; // 最大
  min?: number; // 最小
}
