/* 上传 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './upload.module.less';
import cs from 'classnames';
import { Image, Progress, Upload, UploadFile } from 'antd';
import { CloseCircleFilled, EyeOutlined, PlusOutlined, WarningFilled } from '@ant-design/icons';
import { Bucket, bucketMappingDomain, bucketMappingActionUrl, qiniuTokenUrl, qiniuTokenExtraConfig, antPrefix } from '../../config-v2';
import axios from 'axios';
import { get } from '@/common/request';
import { useMethods } from '@lhb/hook';
import { CombineUploadProps } from './props';
import { floorKeep } from '@lhb/func';
import update from 'immutability-helper';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import V2Message from '../../Others/V2Hint/V2Message';
const type = 'DragableUploadList';
interface DragableUploadListItemProps {
  originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  file: UploadFile;
  fileList: UploadFile[];
  moveRow: (dragIndex: any, hoverIndex: any) => void;
}
const DragableUploadListItem = ({
  originNode,
  moveRow,
  file,
  fileList,
}: DragableUploadListItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const index = fileList.indexOf(file);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item: any) => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: { index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));
  return (
    <div
      ref={ref}
      className={`${antPrefix}-upload-draggable-list-item ${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move' }}
    >
      {originNode}
    </div>
  );
};
export interface V2UploadImageProps extends CombineUploadProps {
  /**
   * @description 上传文件大小，单位为M
   */
  size?: number;
  /**
   * @description 上传文件图片宽度限制，单位px
   */
  width?: number;
  /**
   * @description 上传文件图片高度限制，单位px
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
  /**
   * @description 额外的校验，(file: any) => new Promise(res). res传入false时，代表校验通过。传入string时，代表失败，并会报错
   */
  extraVerified?: (file: any) => Promise<string | boolean>;
  /**
   * @description 内部方法，不外露
   */
  onCustomChange?: Function;
}

function getBase64(file: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const V2UploadImage: React.FC<V2UploadImageProps> = ({
  size = 10,
  width,
  height,
  name,
  maxCount = 5,
  multiple = true,
  fileType = [],
  onPreview, // 点击文件链接或预览图标时的回调
  isPreviewImage = true,
  showSuccessMessage = true,
  children,
  qiniuParams = {
    domain: bucketMappingDomain[Bucket.Default],
    bucket: Bucket.Default,
  },
  useDragItem = false,
  extraVerified,
  ...props
}) => {
  const uploadRef: any = useRef();
  const [fileList, setFileList] = useState<any[]>([]);
  const [prevImage, setPrevImage] = useState<any>({
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
  });
  const [cacheTotal, setCacheTotal] = useState<number>(0);

  useEffect(() => {
    props?.fileList && Array.isArray(props.fileList) && setFileList(props.fileList);
    // @ts-ignore
    props?.onCustomChange?.(props.fileList, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.fileList]);

  const methods = useMethods({
    // 图片尺寸验证
    checkImageWH(file, width, height) { // 参数分别是上传的file，想要限制的宽，想要限制的高
      return new Promise(function(resolve, reject) {
        const filereader = new FileReader();
        filereader.onload = e => {
          const src = e?.target?.result;
          const image = new (Image as any)();
          image.onload = function() {
            if (this.width > width || this.height > height) { // 上传图片的宽高与传递过来的限制宽高作比较，超过限制则调用失败回调
              resolve(false);
            } else {
              resolve(true);
            }
          };
          image.onerror = reject;
          image.src = src;
        };
        filereader.readAsDataURL(file);
      });
    },
    // 上传前限制
    async beforeUpload(file: any, uploadList: any[]) {
      if (extraVerified) {
        const errorText = await extraVerified(file);
        if (errorText) {
          V2Message.error(errorText);
          return Upload.LIST_IGNORE;
        }
      }
      const type = file.name.split('.').pop().toLowerCase();
      const isCanUpload = fileType.includes(type) || fileType === 'any';
      if (!isCanUpload) {
        V2Message.error('不支持的文件类型，请重新上传');
        // 返回false依旧会触发onChange事件，将不符合条件的文件上传，返回Upload.LIST_IGNORE则不会
        return Upload.LIST_IGNORE;
      }
      const isLimitSize = file.size / 1024 / 1024 < size;
      if (!isLimitSize) {
        V2Message.error(`超出最大文件限制${size}M的大小`);
        return Upload.LIST_IGNORE;
      }
      let isWH: any = true;
      if (width && height) {
        try {
          isWH = await methods.checkImageWH(file, width, height);
          if (!isWH) {
            V2Message.error(`超出${width}*${height}的大小`);
            return Upload.LIST_IGNORE;
          }
        } catch (error) {
          V2Message.error(`图片加载失败！`);
        }
      }
      // 存储数量，为了给onchange校验是否超出数量，主要用来做警示
      setCacheTotal(+floorKeep(fileList?.length || 0, uploadList?.length || 0, 2));
      return isCanUpload && isLimitSize && isWH;
    },
    // 自定义上传事件
    async customRequest({
      onError,
      onSuccess,
      onProgress,
      file,
      withCredentials,
      headers,
    }: any) {
      const formData = new FormData();
      formData.append('file', file);
      const qiniuToken = await get(qiniuTokenUrl, { bucket: qiniuParams.bucket }, qiniuTokenExtraConfig);
      if (!qiniuToken.token) return;
      // 将token添加到上传入参中
      formData.append('token', qiniuToken.token);
      const config = {
        withCredentials,
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: ({ total, loaded }: { total: number; loaded: number }) => {
          onProgress({ percent: Math.round((loaded / total) * 100).toFixed(2) }, file);
        },
      };
      // 上传链接
      const upUrl = bucketMappingActionUrl[qiniuParams.bucket];
      axios.post(upUrl, formData, config)
        .then(({ data }) => {
          onSuccess(data, file);
        })
        .catch(onError);
      return {
        abort() {
          console.log('upload progress is aborted.');
        },
      };
    },
    // 上传状态改变
    onChange(file: any) {
      setFileList(file.fileList);
      props?.onChange?.(file.fileList);
      if (file.file.status === 'done') {
        showSuccessMessage && V2Message.success(`${file.file.name} 上传成功`);
        const arr = file.fileList.map((item: any) => {
          const newItem: any = {
            name: item.name,
            uid: item.uid,
            status: item.status,
            percent: item.percent,
            size: item.size
          };
          if (item.url || item.response?.key) {
            newItem.url = item.url || `${qiniuParams.domain}${item.response.key}`;
          }
          return newItem;
        });
        setFileList(arr);
        props?.onChange?.(arr);
        // 只有在所有上传文件都成功之后，才做提示
        if (file.fileList.filter(item => item.originFileObj).every(item => item.status === 'done')) {
          if (cacheTotal > maxCount) { // 如果上传的总文件数量超过可上传数据，虽然允许上传，但是要给一个警示
            V2Message.warning(`系统默认保留前${maxCount}个文件`);
          }
        }
      } else if (file.file.status === 'error') {
        // 上传失败
        V2Message.error(`${file.file.name} 上传失败.`);
      } else if (file.file.status === 'removed') {
        // 移除图片
        props?.onChange?.(file.fileList);
      }
    },
    async handlePreview(file: any) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      if (isPreviewImage) {
        setPrevImage({
          previewImage: file.url || file.preview,
          previewVisible: true,
          previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        });
      } else {
        const url = file.url || file.preview;
        url && window.open(url);
      }
    },
    handleCancel() {
      setPrevImage({ previewVisible: false });
    },
    refactorQiniuImageUrl(url: string) {
      if (typeof url === 'string') {
        if (url.indexOf('?') > -1) {
          const query = url.split('?')[1];
          if (query?.indexOf('imageView') > -1) { // 如果用户设置了，就不去管他
            return url;
          } else {
            return url + '&imageView2/1/w/48/h/48';
          }
        } else {
          return url + '?imageView2/1/w/48/h/48';
        }
      }
      return url;
    }
  });
  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragRow = fileList[dragIndex];
      const newFileList: any = update(fileList, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRow],
        ],
      });
      setFileList(newFileList);
      props?.onChange?.(newFileList);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileList],
  );
  /* components */
  const showItem = (imgSrc, percent, uploadStatus, actions) => {
    // 如果是默认插入的图片、新上传并以成功的、删除进行中的就使用这套样式
    if (!uploadStatus || uploadStatus === 'done' || uploadStatus === 'removed') {
      return (<div className={cs(styles.V2UploadImageItemDone, [uploadStatus === 'removed' && styles.V2UploadImageItemRemoved])}>
        <Image width={48} height={48} src={methods.refactorQiniuImageUrl(imgSrc)} alt='' preview={false}/>
        <div onClick={() => actions.preview()} className={styles.V2UploadImageItemMask}></div>
        <EyeOutlined
          onClick={(e) => {
            e.stopPropagation();
            actions.preview();
          }}
          className={styles.V2UploadImageEye}
          style={{ fontSize: '14px' }}
        />
        <span
          className={styles.V2UploadImageCloseSpan}
          onClick={(e) => {
            e.stopPropagation();
            actions.remove();
          }}
        >
          <CloseCircleFilled className={styles.V2UploadImageClose} style={{ fontSize: '14px' }}/>
        </span>
      </div>);
    } else if (uploadStatus === 'error') { // 如果是上传错误的就用这套样式
      return (<div className={cs(styles.V2UploadingStatsItem, styles.V2UploadingError)}>
        <WarningFilled className={styles.V2UploadingErrorIcon}/>
        <div className={styles.V2UploadingItemProgressTip}>失败</div>
        <span
          className={styles.V2UploadImageCloseSpan}
          onClick={(e) => {
            e.stopPropagation();
            actions.remove();
          }}
        >
          <CloseCircleFilled className={styles.V2UploadImageClose} style={{ fontSize: '14px' }}/>
        </span>
      </div>);
    } else if (uploadStatus === 'uploading') { // 如果是上传进行中的就用这套样式
      return (<div className={styles.V2UploadingStatsItem}>
        <Progress className={styles.V2UploadingItemProgress} percent={Number(percent)} showInfo={false} strokeWidth={4} strokeColor='#006AFF' />
        <div className={styles.V2UploadingItemProgressTip}>上传中</div>
        <span
          className={styles.V2UploadImageCloseSpan}
          onClick={(e) => {
            e.stopPropagation();
            actions.remove();
          }}
        >
          <CloseCircleFilled className={styles.V2UploadImageClose} style={{ fontSize: '14px' }}/>
        </span>
      </div>);
    }
    return undefined;
  };
  const itemRender = (_, file, currFileList, actions) => {
    let imgSrc;
    if (file.thumbUrl) { // 新上传的图片
      if (file.status === 'done') { // 上传成功
        imgSrc = file.thumbUrl;
      }
    } else { // 默认插入的老图片
      imgSrc = file.url;
    }
    return useDragItem ? (
      <DragableUploadListItem
        originNode={(
          <>
            <div className={styles.V2UploadImageItem}>
              {
                showItem(imgSrc, file.percent, file.status, actions)
              }
            </div>
          </>
        )}
        file={file}
        fileList={currFileList}
        moveRow={moveRow}
      />
    ) : (
      <div className={styles.V2UploadImageItem}>
        {
          showItem(imgSrc, file.percent, file.status, actions)
        }
      </div>
    );
  };
  const MainUpload = (
    <Upload
      className={cs(styles.V2UploadDragWrapper, styles.V2UploadImage)}
      {...props}
      fileList={fileList}
      listType='picture-card'
      maxCount={maxCount}
      multiple={multiple}
      name={name}
      beforeUpload={methods.beforeUpload}
      customRequest={methods.customRequest}
      onPreview={onPreview || methods.handlePreview}
      onChange={methods.onChange}
      itemRender={itemRender}
      ref={uploadRef}
    >
      {/* 超过最大上传数量限制时不显示上传按钮 */}
      {children || (maxCount && fileList.length >= maxCount ? null : (
        <div style={{ fontSize: 0 }}>
          <PlusOutlined style={{ fontSize: '14px' }}/>
        </div>
      ))}
    </Upload>
  );
  return (
    <>
      {
        useDragItem ? <DndProvider backend={HTML5Backend}>
          {MainUpload}
        </DndProvider> : MainUpload
      }
      { prevImage.previewVisible && (
        <Image
          width={0}
          style={{ display: 'none' }}
          preview={{
            visible: prevImage.previewVisible,
            src: prevImage.previewImage,
            onVisibleChange: () => {
              methods.handleCancel();
            },
          }}
        />
      ) }
    </>
  );
};

export default V2UploadImage;
