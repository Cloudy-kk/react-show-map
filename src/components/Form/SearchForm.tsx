/* 内置搜索和重置的form */
import React, { useImperativeHandle, useState } from 'react';
import { Form, Button } from 'antd';
import IconFont from '@/common/components/IconFont';

import { SearchFormProps } from './ts-config';
import cs from 'classnames';
import { debounce } from '@lhb/func';
import styles from './index.module.less';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

export interface SearchFormHandles {
  /**
   * @description 重置
   */
  resetFormFields: (isEmit: boolean) => void;
}
const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  children,
  layout = 'inline',
  className,
  labelAlign = 'left',
  labelLength = 4,
  extra,
  onRef,
  onOkText,
  form, // 如果外部传入form则由外部传入form控制
  onFinish, // 如果需要对参数进行处理，则可通过传入onFinish函数来自行处理
  onCustomerReset,
  hiddenOkBtn = false,
  rightOperate,
  showResetBtn = true,
  moreBtn = false,
  showSearchNum = 9,
  ...props
}) => {
  const [searchForm] = Form.useForm();
  const [toggleBtnData, setToggleBtnData] = useState<any>({
    open: false
  });
  // 外部组件清空form
  useImperativeHandle(onRef, () => ({
    resetFormFields: (isEmit: boolean) => {
      onReset(isEmit);
    },
  }));

  // 查询
  const onFinishSearch = () => {
    debounceSearch();
  };

  // 重置
  const onReset = (isEmit = true) => {
    if (!isEmit) return;
    (form || searchForm).resetFields();
    onCustomerReset && onCustomerReset();
    debounceSearch();
  };

  // 查询添加防抖
  const debounceSearch = debounce(() => {
    const values = (form || searchForm).getFieldsValue();
    onSearch && onSearch(values);
  }, 600);
  // 更多塞选切换
  const toggleBtn = () => {
    setToggleBtnData({
      open: !toggleBtnData.open
    });
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Form
        {...props}
        className={cs(styles.formSearch, styles[`searchLabel${labelLength}`], className)}
        form={form || searchForm}
        layout={layout}
        labelAlign={labelAlign}
        onFinish={onFinish || onFinishSearch}
      >
        {
          React.Children.map(children, (child, index) => {
            if (index < showSearchNum || toggleBtnData.open) {
              return React.cloneElement(child as React.ReactElement, {
                form: form || searchForm,
              });
            } else {
              return;
            }
          })
        }
        <Form.Item noStyle>
          <div className='search-form-base-operates'>
            {moreBtn && <Button type='link' onClick={toggleBtn}>{toggleBtnData.open
              ? <span className='color-primary fs-14'>收起 <UpOutlined className='fs-12'/></span> : <span className='color-primary fs-14'>更多筛选 <DownOutlined className='fs-12'/></span> }
            </Button>}
            {!hiddenOkBtn && (
              <Button type='primary' htmlType='submit'>
                {onOkText || '查询'}
              </Button>
            )}
            {
              showResetBtn && (
                <Button
                  className={styles.resetBtn}
                  type='link'
                  icon={<IconFont iconHref='icon-xzzw_ic_reset_normal' />}
                  onClick={() => onReset()}
                >
                重置
                </Button>
              )
            }
            {extra}
          </div>
        </Form.Item>
      </Form>
      <div>
        {rightOperate}
      </div>
    </div>
  );
};

export default SearchForm;
