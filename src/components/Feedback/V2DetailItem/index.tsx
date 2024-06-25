/*
* version: 当前版本2.15.14
*/
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.less';
import cs from 'classnames';
import { Typography, Image, Row, Col, Button, Popover, TooltipProps } from 'antd';
import IconFont from '../../Base/IconFont';
import { each, isNotEmpty, throttle } from '@lhb/func';
import { useMethods } from '@lhb/hook';
import V2VideoPlayer from '../../Data/V2VideoPlayer';
import { unstable_batchedUpdates } from 'react-redux/es/utils/reactBatchedUpdates';
const { PreviewGroup } = Image;
import { imageTypes, officeView, pdfView, specialDownloadTypes, typeMap, videoTypes } from '../../config-v2';

interface filesBtnExtraProps {
  /**
   * @description 内容
   */
  content: ReactNode | string,
  /**
   * @description 点击事件回调
   */
  onClick: (item?: any, index?: number) => void
}
export interface V2DetailItemProps {
  /**
   * @description 类型，可选:[text, textarea(文本域), link(高亮), files(文件)，images(图片)，domExpand(可折叠ReactNode/元素)]
   * @default text
   */
  type?: string;
  /**
   * @description 是否外显文件仅1个,仅在type为files时生效
   */
  exonOneFile?: boolean;
  /**
   * @description 是否隐藏下载按钮，仅 type=files 时生效
   */
  fileDownloadHide?: boolean;
  /**
   * @description 是否禁止自定义下载事件执行，一般搭配onClickDownload进行下载定制化
   */
  fileDownloadDisabled?: boolean;
  /**
   * @description 是否隐藏预览按钮，仅 type=files 时生效
   */
  filePreviewHide?: boolean;
  /**
   * @description 是否可编辑
   */
  allowEdit?: boolean;
  /**
   * @description 文件数组，仅 type=[files, images, videos] 时生效, 详情见下方 AssetsItem
   * @default []
   */
  assets?: any[];
  /**
   * @description 样式类型，可选:[easy, base]
   * @default base
   */
  moduleType?: string;
  /**
   * @description 标签
   */
  label?: string | ReactNode;
  /**
   * @description 内容
   */
  value?: string | ReactNode;
  /**
   * @description 布局结构方向,可选:[horizontal, vertical]
   * @default vertical
   */
  direction?: string;
  /**
   * @description label宽度所占的字符数,此参数仅在`direction=horizontal` 下生效
   * @default 4
   */
  labelLength?: string | number;
  /**
   * @description 最多显示几行,此参数仅在`direction=horizontal` 下生效
   * @default 1
   */
  rows?: number;
  /**
   * @description 在type='domExpand'模式下，最多显示多高，否则会出现展开功能键，超出部分会被收起。ps：line-height默认是20,3行就是60px
   * @default 60px
   */
  domExpandHeight?: string | number;
  /**
   * @description 最多显示几行,此参数仅在`direction=vertical` 的`type=textarea` 下生效
   * @default 2
   */
  textAreaRows?: number;
  /**
   * @description label模块样式
   */
  labelStyle?: React.CSSProperties;
  /**
   * @description files特殊场景下v2DetailItemWrapper的样式
   */
  wrapperStyle?: React.CSSProperties;
  /**
   * @description TooltipProps，请参考 https://4x.ant.design/components/tooltip-cn/#API
   */
  tooltipConfig?: TooltipProps;
  /**
   * @description value模块样式
   */
  valueStyle?: React.CSSProperties;
  groupDirection?: string; // 用来承接V2DetailItemGroup下发的direction参数
  groupLabelLength?: string; // 用来承接V2DetailItemGroup下发的labelLength参数
  groupModuleType?: string; // 用来承接V2DetailItemGroup下发的moduleType参数
  /**
   * @description 内容的点击事件
   */
  onClick?: Function;
  /**
   * @description 编辑模式配置,此参数仅在`direction=vertical` 下生效，详情见下方 EditConfig
   */
  editConfig?: {
    formCom: ReactNode;
    onCancel?: Function;
    onOK?: Function;
    onClick?: Function;
    position?: String;
  };
  /**
   * @description 右侧按钮插槽,此参数仅在`direction=vertical` 下生效，详情见下方 EditConfig
   */
  rightSlot?: {
    icon: ReactNode;
    onIconClick?: Function;
  };
  /**
   * @description 自定义className
   */
  className?: string;
  /**
   * @description slot插槽
   */
  children?: ReactNode;
  /**
   * @description 纯净版样式
   */
  noStyle?: boolean;
  /**
   * @description 横向时，flex对其方式,可设置为 'center'
   */
  flexAlignItems?: string;
  /**
   * @description 额外按钮插槽数组
   */
  filesBtnExtra?: filesBtnExtraProps[];
  /**
   * @description 是否使用展开收起功能，仅供文本模式：纵向（仅支持type=textarea），横向（不限制文本）。ReactNode或元素模式请直接使用type=domExpand
   */
  useMoreBtn?: boolean;
  /**
   * @description 文件类型点击预览事件
   */
  onClickPreview?: (val: any) => void;
  /**
   * @description 文件类型点击下载事件
   */
  onClickDownload?: (val: any) => void;
  /**
   * @description 纵向模式下，label和value中间的插槽。
   */
  verticalMiddleHelp?: ReactNode | string;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/feedback/v2detail-item
*/
const V2DetailItem: React.FC<V2DetailItemProps> = ({
  type = 'text',
  exonOneFile = false,
  allowEdit,
  assets = [],
  groupModuleType,
  moduleType,
  noStyle = false,
  flexAlignItems,
  groupDirection,
  direction,
  groupLabelLength,
  labelLength,
  label,
  value,
  labelStyle = {},
  tooltipConfig = {},
  valueStyle = {},
  wrapperStyle = {},
  rows = 1,
  domExpandHeight = '60px',
  textAreaRows = 2,
  onClick,
  children,
  editConfig = {
    formCom: undefined,
    onCancel: () => {},
    onOK: () => {},
    onClick: () => {},
    position: 'rightBottom'
  },
  rightSlot = {
    icon: undefined,
    onIconClick() {}
  },
  className,
  fileDownloadHide,
  fileDownloadDisabled,
  filePreviewHide,
  filesBtnExtra,
  useMoreBtn = false,
  onClickPreview,
  onClickDownload,
  verticalMiddleHelp
}) => {
  const domExpandRef = useRef(null);
  let _direction = direction || groupDirection;
  if (!_direction) {
    _direction = 'vertical'; // 默认是纵向
  }
  let _labelLength = labelLength || groupLabelLength;
  if (!_labelLength) {
    _labelLength = 4; // 默认4个字长度
  }
  let _moduleType = moduleType || groupModuleType;
  if (!_moduleType) {
    _moduleType = 'base'; // 默认 base
  }
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [key, setKey] = useState(0); // 用来为收起操作，做组件强制更新用。
  const [isExpanded, setIsExpanded] = useState(false); // 记录当前是否是展开状态
  const [useDomExpanded, setUseDomExpanded] = useState(false); // 是否开启type
  const [prevImage, setPrevImage] = useState<any>({
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
  });
  const paragraphProps: any = { // 纵向textarea和横向value内嵌的配置
    key,
    ellipsis: {
      tooltip: useMoreBtn ? undefined : {
        title: _direction === 'vertical' ? value : (isNotEmpty(value) ? value : '-'),
        overlayInnerStyle: {
          maxHeight: '180px',
          overflowY: 'auto',
        },
        ...tooltipConfig,
      },
      rows: _direction === 'vertical' ? textAreaRows : rows,
      ...(useMoreBtn ? { // 使用展开收起操作，使用这套配置
        expandable: true,
        symbol: '展开',
        onExpand() {
          setIsExpanded(true);
        }
      } : {})
    },
    style: { maxWidth: '100%', ...(useMoreBtn ? { position: 'relative' } : {}), ...valueStyle },
    onClick: () => onClick && onClick()
  };

  const fileAssets = useMemo(() => {
    if (type === 'files' && exonOneFile && assets?.length > 1) {
      return {
        exonAssets: [assets[0]],
        hideAssets: assets.slice(1),
      };
    } else {
      return {
        exonAssets: assets,
        hideAssets: [],
      };
    }
  }, [assets, type, exonOneFile]);
  const methods = useMethods({
    onIconClick() {
      if (rightSlot.icon) { // 如果是自定义icon，就使用自定义icon的套路
        rightSlot.onIconClick && rightSlot.onIconClick();
      } else {
        editConfig.onClick && editConfig.onClick();
        setIsEdit(true);
      }
    },
    editCancel() {
      setIsEdit(false);
      editConfig.onCancel && editConfig.onCancel();
    },
    async editOK() {
      if (editConfig.onOK) {
        await editConfig.onOK();
      }
      setIsEdit(false);
    },
    packDown() { // 目前是 type domExpand调用，
      setIsExpanded(true);
    },
    packUp() {
      unstable_batchedUpdates(() => {
        setKey(key + 1);
        setIsExpanded(false);
      });
    },
    onClickPreview(item) { // 点击预览
      if (imageTypes.includes(item.suffix)) { // 图片预览
        setPrevImage({
          previewImage: item.url,
          previewVisible: true,
          previewTitle: item.name,
        });
      }
      onClickPreview?.(item);
    },
    handlePreviewImageCancel() {
      setPrevImage({ previewVisible: false });
    },
    refactorQiniuImageUrl(url: string) {
      if (typeof url === 'string') {
        if (url.indexOf('?') > -1) {
          const query = url.split('?')[1];
          if (query?.indexOf('imageView') > -1) { // 如果用户设置了，就不去管他
            return url;
          } else {
            return url + '&imageView2/1/w/45/h/48';
          }
        } else {
          return url + '?imageView2/1/w/45/h/48';
        }
      }
      return url;
    }
  });
  /* components render */
  const renderVerticalValue = (_assets?: any[]) => { // _assets目前只给files用
    if (type === 'files') {
      const customAssets = _assets || fileAssets.exonAssets;
      if (!customAssets?.length) {
        return '-';
      }
      customAssets.forEach((item) => {
        const suffix = item.name?.split('?')[0].match(/[^.]+$/)[0];
        item.suffix = suffix;
        // 没多少轮询量，不需要考虑break
        each(typeMap, (itm, key) => {
          if (key.split(',').includes(suffix)) {
            item.type = itm;
          }
        });
        if (!item.type) {
          item.type = 'pc-common-icon-file_icon_unknow'; // 未知文件
        }
      });
      const refactorUrl = (url, name, suffix) => {
        if (imageTypes.includes(suffix)) { // 如果是图片就不再返回跳转链接，而进行点击预览
          return;
        } else if (videoTypes.includes(suffix)) { // 视频预览
          let targetUrl = `https://staticres.linhuiba.com/libs/preview-video/index.html?url=${url}`;
          if (name) {
            targetUrl += `&filename=${encodeURIComponent(name)}`;
          }
          return targetUrl;
        } else if (officeView.includes(suffix)) { // office预览
          let targetUrl = `https://staticres.linhuiba.com/libs/preview-office/index.html?url=${url}&office=1`;
          if (name) {
            targetUrl += `&filename=${encodeURIComponent(name)}`;
          }
          return targetUrl;
        } else if (pdfView.includes(suffix)) { // pdf预览
          return `https://staticres.linhuiba.com/libs/preview-pdf/web/viewer.html?file=${url}` + encodeURIComponent(`#${name}`);
        } else if (specialDownloadTypes.includes(suffix)) {
          return `${url}?attname=${encodeURIComponent(name)}`;
        }
        return url;
      };
      return (<div className={styles.v2DetailItemFiles}>
        {
          customAssets.map((item, index) => {
            return (
              <div
                key={index}
                className={cs([
                  styles.v2ItemFiles,
                  exonOneFile && !_assets && styles.v2ItemFilesExonOneFile
                ])}
              >
                <div className={styles.v2ItemFilesRight}>
                  <span className={styles.v2ItemFilesName}>{item.name || '-'}</span>
                  {
                    !filePreviewHide && <a className={styles.v2ItemFilesBtn} href={refactorUrl(item.url, item.name, item.suffix)} target='_blank' rel='noreferrer' onClick={() => methods.onClickPreview(item)}>预览</a>
                  }
                  {
                    !fileDownloadHide && <a className={styles.v2ItemFilesBtn} href={fileDownloadDisabled ? undefined : `${item.url}?attname=${encodeURIComponent(item.name)}`} target='_blank' rel='noreferrer' onClick={() => onClickDownload?.(item)}>下载</a>
                  }
                  {
                    filesBtnExtra?.map((btnItem, btnIndex) => {
                      return <a key={btnIndex} className={styles.v2ItemFilesBtn} onClick={() => btnItem.onClick(item, index)}>{btnItem.content}</a>;
                    })
                  }
                </div>
                <div className={styles.v2ItemFilesLeft}>
                  <IconFont iconHref={item.type}/>
                </div>
              </div>
            );
          })
        }
      </div>);
    } else if (type === 'images') {
      if (!assets?.length) {
        return '-';
      }
      return (<Row gutter={[8, 8]} className={styles.v2DetailItemImages}>
        <PreviewGroup
          preview={{
            getContainer: false
          }}
        >
          {
            assets.map((item, index) => {
              return (
                <Col key={index}>
                  <Image
                    src={methods.refactorQiniuImageUrl(item.url)}
                    width={45}
                    height={48}
                    preview={{
                      src: item.url
                    }}
                  />
                </Col>
              );
            })
          }
        </PreviewGroup>
      </Row>);
    } else if (type === 'videos') {
      if (!assets?.length) {
        return '-';
      }
      return (
        <Row gutter={[8, 8]} className={styles.v2DetailItemImages}>
          {
            assets.map((item, index) => {
              return (<Col key={index}>
                <V2VideoPlayer height={112} width={200} styleType='young' src={item.url}/>
              </Col>);
            })
          }
        </Row>
      );
    } else if (type === 'textarea') {
      if (!isNotEmpty(value)) {
        return '-';
      }
      return (<Typography.Paragraph {...paragraphProps}>
        {value}
        {
          useMoreBtn && isExpanded && <span className={styles.v2DetailPackUp} onClick={methods.packUp}>收起</span>
        }
      </Typography.Paragraph>);
    } else if (type === 'domExpand') {
      if (!isNotEmpty(value)) {
        return '-';
      }
      return (
        <div
          ref={domExpandRef}
          className={cs([
            styles.v2DomExpandWrapper,
            isExpanded && styles.v2DomExpandWrapperAuto,
            'V2DomExpandWrapper',
          ])}
          style={{ maxHeight: domExpandHeight }}
        >
          {isNotEmpty(value) ? value : '-'}
          {
            useDomExpanded && !isExpanded && <div className={styles.v2DomExpandMore} onClick={methods.packDown}>
              <span>展开</span>
            </div>
          }
          {
            useDomExpanded && isExpanded && <div className={styles.v2DetailPackUp} onClick={methods.packUp}>收起</div>
          }
        </div>
      );
    } else {
      if (!isNotEmpty(value)) {
        return '-';
      }
      return (<Typography.Text
        ellipsis={{ tooltip: {
          title: value,
          overlayInnerStyle: {
            maxHeight: '180px',
            overflowY: 'auto',
          },
          ...tooltipConfig,
        } }}
        style={{ maxWidth: '100%', ...valueStyle }}
        onClick={() => onClick && onClick()}
      >
        {value}
      </Typography.Text>);
    }
  };
  const DetailItem = (
    <div
      className={cs(
        styles.v2DetailItem,
        [
          _moduleType === 'easy' ? styles.v2DetailItemEasy : styles.v2DetailItemBase,
          _direction === 'horizontal' && styles.v2DetailItemHorizontal,
          type === 'link' && styles.v2DetailItemTypeLink,
          type === 'videos' && styles.v2DetailItemTypeVideos,
          (rightSlot.icon || allowEdit) && styles.v2DetailItemTypeEdit,
          noStyle && styles.v2DetailItemNoStyle,
          isExpanded && styles.v2DetailItemIsExpanded,
          // 这里是对特殊场景下 横向时， ant-typography的优化
          _direction === 'horizontal' && useMoreBtn && !isExpanded && (textAreaRows === 2 || rows === 2) && styles.v2DetailItemHiddenRow2,
          _direction === 'horizontal' && useMoreBtn && !isExpanded && (textAreaRows === 3 || rows === 3) && styles.v2DetailItemHiddenRow3,
        ],
        className
      )}
      style={{
        alignItems: flexAlignItems
      }}
    >
      {
        _direction === 'vertical' ? <>
          <div className={styles.v2DetailItemLabel} style={labelStyle}>{label}</div>
          {verticalMiddleHelp}
          {
            // 编辑态直接使用外传form控件
            isEdit ? <div className={cs(styles.v2DetailItemValueWrapper, styles.v2DetailItemValueEdit)}>
              {editConfig.formCom}
              <div className={cs([
                styles.v2DetailItemEditBtn,
                // 默认是 rightBottom
                editConfig.position === 'rightTop' && styles.v2DetailItemEditBtnRightTop,
                editConfig.position === 'leftBottom' && styles.v2DetailItemEditBtnLeftBottom,
                editConfig.position === 'leftTop' && styles.v2DetailItemEditBtnLeftTop,
              ])}>
                <Button onClick={methods.editOK} icon={<IconFont style={{ fontSize: '16px' }} iconHref='pc-common-icon-ic_sure' />} />
                <Button onClick={methods.editCancel} icon={<IconFont style={{ fontSize: '12px' }} iconHref='pc-common-icon-ic_closeone' />} />
              </div>
            </div> : (
              children || <div className={cs(styles.v2DetailItemValue, styles.v2DetailItemValueWrapper, 'v2DetailItemValue')} style={valueStyle}>
                {
                  renderVerticalValue()
                }
                {
                  (rightSlot.icon || allowEdit) && <div
                    className={styles.v2DetailItemValueExtra}
                    onClick={methods.onIconClick}
                  >
                    {rightSlot.icon ? rightSlot.icon : <IconFont iconHref='pc-common-icon-ic_edit'/>}
                  </div>
                }
              </div>
            )
          }
        </> : <>
          <span
            className={styles.v2DetailItemLabel}
            style={{
              width: `${_labelLength}em`,
              ...labelStyle
            }}
          >{label}</span>
          {
            children || (
              <>
                {
                  type === 'domExpand' ? ( // 如果是富文本折叠功能，ps：这是一个特殊场景
                    <>
                      <div
                        ref={domExpandRef}
                        className={cs([
                          styles.v2DomExpandWrapper,
                          isExpanded && styles.v2DomExpandWrapperAuto,
                          'V2DomExpandWrapper',
                        ])}
                        style={{ maxHeight: domExpandHeight }}
                      >
                        {isNotEmpty(value) ? value : '-'}
                        {
                          useDomExpanded && !isExpanded && <div className={styles.v2DomExpandMore} onClick={methods.packDown}>
                            <span>展开</span>
                          </div>
                        }
                        {
                          useDomExpanded && isExpanded && <div className={styles.v2DetailPackUp} onClick={methods.packUp}>收起</div>
                        }
                      </div>
                    </>
                  ) : (
                    <Typography.Paragraph {...paragraphProps}>
                      {isNotEmpty(value) ? value : '-'}
                      {
                        useMoreBtn && isExpanded && <span className={styles.v2DetailPackUp} onClick={methods.packUp}>收起</span>
                      }
                    </Typography.Paragraph>
                  )
                }
              </>
            )
          }
        </>
      }
    </div>
  );
  useEffect(() => {
    const target: any = domExpandRef.current;
    const listenerResize = throttle(() => {
      if (target.scrollHeight >= parseInt(domExpandHeight + '')) { // 此时需要提供展开收起功能，因为数据是溢出的。
        setUseDomExpanded(true);
      } else {
        setUseDomExpanded(false);
      }
    }, 100);
    if (type === 'domExpand' && target && value) {
      listenerResize();
      window.addEventListener('resize', listenerResize);
    }
    return () => {
      if (type === 'domExpand' && target && value) {
        window.removeEventListener('resize', listenerResize);
      }
    };
  }, [value]);
  return (
    <>
      {
        fileAssets.hideAssets.length ? <div className={styles.v2DetailItemWrapper} style={wrapperStyle}>
          {DetailItem}
          <div>
            <Popover overlayStyle={{ width: '312px' }} placement='bottomRight' content={renderVerticalValue(fileAssets.hideAssets)} trigger='hover'>
              <div className={styles.v2DetailItemFilesMore}>
                <div className={styles.v2DetailItemFilesMoreFlex}>
                  <span>
                    <IconFont iconHref='pc-common-icon-ic_file1'/>
                  </span>
                  <span className={styles.v2DetailItemFilesMoreNum}>
                    { fileAssets.hideAssets.length }
                  </span>
                </div>
              </div>
            </Popover>
          </div>
        </div> : DetailItem
      }
      {/* 如果是文件类型，且有文件时，就需要去做特殊预览功能 */}
      {
        type === 'files' && !!assets?.length && prevImage.previewVisible && (
          <Image
            width={0}
            style={{ display: 'none' }}
            preview={{
              visible: prevImage.previewVisible,
              src: prevImage.previewImage,
              onVisibleChange: () => {
                methods.handlePreviewImageCancel();
              },
            }}
          />
        )
      }
    </>
  );
};
V2DetailItem.displayName = 'V2DetailItem';
export default V2DetailItem;
