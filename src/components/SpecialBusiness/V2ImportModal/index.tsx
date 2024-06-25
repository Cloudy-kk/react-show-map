import React, { useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';
import cs from 'classnames';
import { Form, FormInstance, Modal, ModalProps } from 'antd';
import V2Title from '../../Feedback/V2Title';
import V2DetailItem, { V2DetailItemProps } from '../../Feedback/V2DetailItem';
import V2FormUpload from '../../Form/V2FormUpload/V2FormUpload';
import { CombineUploadProps } from '../../Form/V2FormUpload/props';
import V2Form, { V2FormProps } from '../../Form/V2Form';
import V2Table, { V2TableProps } from '../../Data/V2Table';
import IconFont from '../../Base/IconFont';
import { useMethods } from '@lhb/hook';

export interface minorModuleProps {
  /**
   * @description 点击按钮文本
   * @default 导入历史记录
   */
  text?: string;
  /**
   * @description 点击按钮icon
   * @default pc-common-icon-lishi
   */
  icon?: string;
  /**
   * @description 更多ant-modal的配置，请查看 https://4x.ant.design/components/modal-cn/
   * @type ModalProps
   */
  modalConfig?: ModalProps;
  /**
   * @description 弹窗内容自定义插槽
   */
  children?: React.ReactNode;
  /**
   * @description 默认的历史列表配置，参考V2Table
   * @type V2TableProps
   */
  tableConfig?: V2TableProps;
  /**
   * @description 点击次要按钮的回调事件
   */
  onMinorBtnClick?: () => void;
}
export interface resultModuleProps {
  /**
   * @description 总数
   */
  total?: number | string;
  /**
   * @description 成功数
   */
  successNum?: number | string;
  /**
   * @description 失败数
   */
  errorNum?: number | string;
  /**
   * @description 文件数组, 详情见 V2DetailItem
   * @default []
   */
  assets?: any[];
  /**
   * @description 导入结果title
   * @default 导入结果
   */
  title?: React.ReactNode;
}

export interface V2ImportModalProps {
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 是否显示
   * @default false
   */
  visible: boolean;
  /**
   * @description 操作是否显示
   */
  setVisible: (v: boolean) => void;
  /**
   * @description 标题
   */
  title?: string;
  /**
   * @description 操作引导：第一步标题
   * @default 第一步：下载Excel模版，按照模版整理数据。
   */
  firstStageTitle?: string;
  /**
   * @description 操作引导：第二步标题
   * @default 第二步：上传需要导入的Excel文件。
   */
  secondStageTitle?: string;
  /**
   * @description 操作引导：上侧插槽
   */
  stageTopRender?: React.ReactNode;
  /**
   * @description 文件数组, 详情见 V2DetailItem
   * @default []
   */
  assets?: any[];
  /**
   * @description 确定提交回调
   */
  onSubmitExcel: (v: any) => void;
  /**
   * @description 导入结果配置
   * @type resultModuleProps
   */
  resultModule?: resultModuleProps;
  /**
   * @description 次要模块配置
   */
  minorModule?: minorModuleProps | boolean;
  /**
   * @description 更多ant-modal的配置，请查看 https://4x.ant.design/components/modal-cn/
   * @type ModalProps
   */
  modalConfig?: ModalProps;
  /**
   * @description 更多upload配置，请查看 V2FormUpload type=file
   * @type CombineUploadProps
   */
  uploadConfig?: CombineUploadProps;
  /**
   * @description 更多form配置，请查看 V2Form
   * @type V2FormProps
   */
  formConfig?: V2FormProps;
  /**
   * @description form表单的实例
   */
  form?: FormInstance;
  /**
   * @description 模板下载处的V2DetailItem配置项
   */
  downloadModuleProps?: V2DetailItemProps;
}

/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/special/v2import-modal
*/
const V2ImportModal: React.FC<V2ImportModalProps> = ({
  className,
  title,
  visible,
  assets,
  setVisible,
  onSubmitExcel,
  resultModule,
  minorModule,
  modalConfig = {},
  uploadConfig = {},
  formConfig = {},
  firstStageTitle = '第一步：下载Excel模版，按照模版整理数据。',
  secondStageTitle = '第二步：上传需要导入的Excel文件。',
  stageTopRender,
  form,
  downloadModuleProps
}) => {
  const [baseForm] = Form.useForm();
  const _form = form || baseForm;
  const [minorVisible, setMinorVisible] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const methods = useMethods({
    onOk() {
      if (step === 1) {
        _form.validateFields().then(async (res) => {
          await onSubmitExcel(res);
          if (resultModule) { // 如果有导入结果模块，就暂时先不关闭弹窗
            setStep(2);
          } else {
            setVisible(false);
          }
        });
      } else {
        setVisible(false);
      }
    },
    onCancel() {
      setVisible(false);
    },
    async onMinorBtnClick() {
      await minorConfig?.onMinorBtnClick?.();
      setMinorVisible(true);
    }
  });
  useEffect(() => {
    if (visible) {
      setStep(1);
      _form.setFieldValue('file', []);
    }
  }, [visible]);
  const minorConfig: minorModuleProps = typeof minorModule === 'boolean' ? {} : (minorModule || {});

  const Step1 = (
    <V2Form form={_form} {...formConfig}>
      { stageTopRender }
      <V2Title type='H3' style={{ marginBottom: '12px' }}>{firstStageTitle}</V2Title>
      <V2DetailItem
        className={styles.V2ImportModalDetailItem}
        noStyle
        type='files'
        assets={assets}
        filePreviewHide
        {
          ...downloadModuleProps
        }
      />
      <V2Title
        type='H3'
        style={{ marginTop: '32px', marginBottom: '16px' }}
        extra={
          minorModule ? (
            <div className={styles.V2ImportModalHistoryBtn} onClick={methods.onMinorBtnClick}>
              <IconFont
                className={styles.V2ImportModalHistoryIcon}
                iconHref={minorConfig?.icon || 'pc-common-icon-lishi'}
              />
              { minorConfig?.text || '导入历史记录'}
            </div>
          ) : undefined
        }
      >
        {secondStageTitle}
      </V2Title>
      <V2FormUpload
        label='excel文件'
        name='file'
        required
        fileTipRender={({ size, fileType }) => {
          return `支持${Array.isArray(fileType) ? fileType.join('、') : '任意'}文件，单个文件不超过 ${size}M`;
        }}
        config={{
          maxCount: 1,
          fileType: ['xlsx', 'xls'],
          size: 10,
          ...uploadConfig
        }}
        formItemConfig={{
          style: {
            marginBottom: 0
          },
          className: styles.V2ImportModalUpload
        }}
      />
    </V2Form>
  );
  const Step2 = (
    <>
      <V2Title type='H3' style={{ marginBottom: '12px' }}>共{resultModule?.total || 0}条数据，导入成功{resultModule?.successNum || 0}条，导入失败{resultModule?.errorNum || 0}条</V2Title>
      <V2DetailItem
        className={styles.V2ImportModalDetailItem}
        noStyle
        type='files'
        assets={resultModule?.assets || []}
        filePreviewHide
      />
    </>
  );
  const renderTitle = useMemo(() => {
    if (step === 2) {
      return resultModule?.title || '导入结果';
    }
    return title;
  }, [step, title]);
  return (
    <Modal
      title={renderTitle}
      open={visible}
      className={cs([styles.V2ImportModal, className])}
      width={648}
      onOk={methods.onOk}
      bodyStyle={{
        paddingLeft: '90px',
        paddingRight: '90px',
      }}
      onCancel={methods.onCancel}
      forceRender
      {
        ...modalConfig
      }
    >
      <div className={styles.V2ImportModalSteps}>
        {
          step === 1 && Step1
        }
        {
          step === 2 && Step2
        }
      </div>
      {
        minorConfig && (
          <Modal
            title='导入历史记录'
            open={minorVisible}
            width={648}
            onOk={() => setMinorVisible(false)}
            onCancel={() => setMinorVisible(false)}
            forceRender
            {
              ...minorConfig.modalConfig
            }
          >
            {
              minorConfig.children || (
                minorConfig.tableConfig ? <V2Table
                  {
                    ...minorConfig.tableConfig
                  }
                /> : undefined
              )
            }
          </Modal>
        )
      }
    </Modal>
  );
};

export default V2ImportModal;
