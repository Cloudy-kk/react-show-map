/*
* 详情参数配置请看
* https://www.wangeditor.com/v5/menu-config.html#%E6%9C%8D%E5%8A%A1%E7%AB%AF%E5%9C%B0%E5%9D%80
*/
import React, { FC, ReactNode, useEffect, useState } from 'react';
import '@wangeditor/editor/dist/css/style.css';
import styles from './index.module.less';
import cs from 'classnames';
import { Form } from 'antd';
import { FormItemProps } from 'antd/lib/form/index';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import { SlateTransforms } from '@wangeditor/editor';
import type { IDomEditor, IEditorConfig, SlateDescendant } from '@wangeditor/editor'; // 引入类型
import { toolbarConfig, getMenuConf } from './config';
import { deepMerge } from '@lhb/func';
// 图片的格式
const newNode: { type: string, children: SlateDescendant[] } = { // 生成新节点
  type: 'paragraph',
  children: []
};
export interface DefaultFormItemProps {
  /**
   * @description 字段名，支持数组
   */
  name?: string | number | (string | number)[];
  /**
   * @description label 标签的文本
   */
  label?: ReactNode;
  /**
   * @description 为 true 时不带样式，作为纯字段控件使用
   * @default  false
   */
  noStyle?: boolean;
  /**
   * @description Form.Item中rule属性设置，具体请参考 https://ant.design/components/form-cn/#Rule
   */
  rules?: any[];
  /**
   * @description Form.Item的属性设置，具体请参考 https://ant.design/components/form-cn/#Form.Item
   * @default   {}
   */
  formItemConfig?: FormItemProps; // Form.Item的其他入参
}

//  textarea输入框
export interface V2FormWangEditorProps extends DefaultFormItemProps {
  /**
   * @description 输入框提示
   * @default  如有label则为请输入+label，否则为请输入
   */
  placeholder?: string;
   /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
  /**
   * @description 更新回调 (data) => {}
   */
  onChange?: Function;
  /**
   * @description 创建回调 (data) => {}
   */
  onCreated?: Function;
  /**
   * @description 样式
   */
  editorStyle?: React.CSSProperties;
  /**
   * @description 额外的editorConfig,详情参考 wangeditor 5.x文档
   */
  extraEditorConfig?: any
  /**
   * @description 图片上传大小限制
   * @default 10M
   */
  imageSize?: number;
  /**
   * @description 视频上传大小限制
   * @default 100M
   */
  videoSize?: number;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-wang-editor
*/
const V2FormWangEditor: FC<V2FormWangEditorProps> = ({
  label,
  name,
  rules = [],
  placeholder = `请输入${label || ''}`,
  noStyle = false,
  formItemConfig,
  required,
  onChange,
  onCreated,
  editorStyle = {},
  extraEditorConfig = {},
  imageSize = 10, // 图片上传大小 单位 M
  videoSize = 200, // 图片上传大小 单位 M
}) => {
  if (required && !rules?.length) {
    console.error('V2FormWangEditor：设置required的同时，必须设置rules！！！');
  }
  const [editor, setEditor] = useState<IDomEditor | null>(null); // 存储 editor 实例，指定editor的类型
  const [isDisable, setIsDisable] = useState<boolean>(false);
  const editorConfig: Partial<IEditorConfig> = {
    placeholder,
    // 记录下 editor 实例，重要！
    onCreated(editorCase: IDomEditor) {
      setEditor(editorCase);
      onCreated && onCreated({
        ...editorCase,
        disable() {
          setIsDisable(true);
          editorCase.disable();
        },
        enable() {
          setIsDisable(false);
          editorCase.enable();
        },
      }, function init(text) {
        editorCase.select([]); // 全选编辑器中的内容
        editorCase.deleteFragment(); // 删除编辑器中被选中内容
        SlateTransforms.setNodes(editorCase, newNode, { mode: 'highest' }); // 配置编辑器使用新节点，节点模式设为最高级
        editorCase.dangerouslyInsertHtml(text); // 插入html内容
      });
    },
    onChange(editor: IDomEditor) {
      const html = editor.getHtml();
      if (html === '<p><br></p>') { // 清空内容后会返回如下字符串
        onChange && onChange(undefined);
      } else {
        onChange && onChange(html);
      }
    },
    MENU_CONF: getMenuConf(imageSize, videoSize),
  };
  // 及时销毁editor，防止内存泄露，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);
  return (
    <Form.Item
      noStyle={noStyle}
      name={name}
      label={label}
      rules={rules}
      required={required}
      className={cs(styles.V2FormWangEditor, [
        isDisable && styles.V2FormWangEditorDisabled
      ])}
      {...formItemConfig}>
      <div className={styles.V2FormWangEditorWrapper}>
        <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode='simple'
          style={{ borderBottom: '1px solid #ddd' }}
        />
        <Editor
          defaultConfig={deepMerge(editorConfig, extraEditorConfig)}
          mode='simple'
          style={{
            height: '300px',
            margin: 0,
            padding: 0,
            marginBottom: 7,
            overflowY: 'hidden',
            ...editorStyle
          }}
        />
      </div>
    </Form.Item>
  );
};
V2FormWangEditor.displayName = 'V2FormWangEditor';
export default V2FormWangEditor;
