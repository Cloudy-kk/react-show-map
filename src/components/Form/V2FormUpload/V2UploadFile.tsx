/* version: 2.15.4 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './upload.module.less';
import cs from 'classnames';
import { Progress, Upload, UploadFile, Image } from 'antd';
import { UploadOutlined, WarningFilled } from '@ant-design/icons';
import { Bucket, bucketMappingDomain, bucketMappingActionUrl, qiniuTokenUrl, qiniuTokenExtraConfig, antPrefix, officeView, videoTypes, imageTypes, pdfView, typeMap, specialDownloadTypes } from '../../config-v2';
import axios from 'axios';
import { get } from '@/common/request';
import { useMethods } from '@lhb/hook';
import { downloadFile, each, floorKeep, matchQuery } from '@lhb/func';
import IconFont from '../../Base/IconFont';
import { CombineUploadProps } from './props';
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

export interface V2UploadFileProps extends CombineUploadProps {
  /**
   * @description 上传文件大小，单位为M
   */
  size?: number;
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
   * @description 是否插入qiniu云下载所需要的 attname 参数，插入后，只要是qiniu云的链接，都会仅下载而不预览
   * @default false
   */
  setAttName?: boolean;
  /**
   * @description 额外的校验，(file: any) => new Promise(res). res传入false时，代表校验通过。传入string时，代表失败，并会报错
   */
  extraVerified?: (file: any) => Promise<string | boolean>;
  /**
   * @description 内部方法，不外露
   */
  onCustomChange?: Function;
  /**
   * @description 文件提示插槽Render, config返回参数 {size, fileType}
   */
  fileTipRender?: (config: any) => React.ReactNode;
}

const V2UploadFile: React.FC<V2UploadFileProps> = ({
  size = 10,
  name,
  maxCount = 5,
  multiple = true,
  fileType = 'any',
  showSuccessMessage = true,
  children,
  setAttName = false,
  qiniuParams = {
    domain: bucketMappingDomain[Bucket.Default],
    bucket: Bucket.Default,
  },
  useDragItem = false,
  extraVerified,
  fileTipRender,
  ...props
}) => {
  const uploadRef: any = useRef();
  const [fileList, setFileList] = useState<any[]>([]);
  const [cacheTotal, setCacheTotal] = useState<number>(0);
  const [prevImage, setPrevImage] = useState<any>({
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
  });
  useEffect(() => {
    props?.fileList && Array.isArray(props.fileList) && setFileList(props.fileList);
    // @ts-ignore
    props?.onCustomChange?.(props.fileList, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.fileList]);

  const methods = useMethods({
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
      // 存储数量，为了给onchange校验是否超出数量，主要用来做警示
      setCacheTotal(+floorKeep(fileList?.length || 0, uploadList?.length || 0, 2));
      return isCanUpload && isLimitSize;
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
        timeout: 0
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
      if (file.file.status !== 'removed') {
        if (file.fileList?.length > 5) {
          const target = uploadRef.current.querySelector(`.${antPrefix}-upload-list-text`);
          target.scrollTop = target.scrollHeight;
        }
      }
      if (file.file.status === 'done') { // 上传成功
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
    onClick(fileSrc, name, suffix, uploadStatus) {
      if ((!uploadStatus || uploadStatus === 'done') && fileSrc) {
        if ((setAttName || specialDownloadTypes.includes(suffix)) && name) {
          let _fileSrc = fileSrc;
          if (fileSrc.indexOf('?') === -1) {
            _fileSrc = fileSrc + '?attname=' + encodeURIComponent(name);
          } else {
            const attname = matchQuery(fileSrc, 'attname');
            if (!attname) {
              _fileSrc = fileSrc + '?attname=' + encodeURIComponent(name);
            }
          }
          downloadFile({ name, downloadUrl: _fileSrc });
        } else {
          if (imageTypes.includes(suffix)) { // 图片预览
            setPrevImage({
              previewImage: fileSrc,
              previewVisible: true,
              previewTitle: name,
            });
            return;
          } else if (videoTypes.includes(suffix)) { // 视频预览
            fileSrc = `https://staticres.linhuiba.com/libs/preview-video/index.html?url=${fileSrc}`;
            if (name) {
              fileSrc += `&filename=${encodeURIComponent(name)}`;
            }
          } else if (officeView.includes(suffix)) { // office预览
            fileSrc = `https://staticres.linhuiba.com/libs/preview-office/index.html?url=${fileSrc}&office=1`;
            if (name) {
              fileSrc += `&filename=${encodeURIComponent(name)}`;
            }
          } else if (pdfView.includes(suffix)) { // pdf预览
            fileSrc = `https://staticres.linhuiba.com/libs/preview-pdf/web/viewer.html?file=${fileSrc}` + encodeURIComponent(`#${name}`);
          }
          downloadFile({ name, preview: true, url: fileSrc });
        }
      }
    },
    handlePreviewImageCancel() {
      setPrevImage({ previewVisible: false });
    },
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
  const showItem = (fileSrc, file, actions) => {
    const uploadStatus = file.status;
    const suffix = file.name.split('.').pop().toLowerCase();
    let type = 'pc-common-icon-file_icon_unknow'; // 未知文件
    // 没多少轮询量，不需要考虑break
    each(typeMap, (itm, key) => {
      if (key.split(',').includes(suffix)) {
        type = itm;
      }
    });
    return (
      <div className={cs([
        styles.V2UploadingStatsItem,
        'v2UploadFileStatsItem',
        uploadStatus === 'uploading' && styles.V2StatusUploading,
        uploadStatus === 'error' && styles.V2StatusError,
        (!uploadStatus || uploadStatus === 'done') && styles.V2StatusDone,
      ])}
      >
        <div className={styles.V2UploadingStatsItemWrapper}>
          <div className={styles.V2UploadingStatsMain}>
            {
              uploadStatus === 'error' ? <WarningFilled className={styles.V2UploadingStatsMainIcon}/> : <IconFont className={styles.V2UploadingStatsMainIcon} iconHref={type}/>
            }
            <div className={styles.V2UploadingStatsMainName} onClick={() => methods.onClick(fileSrc, file.name, suffix, uploadStatus)}>
              {file.name || '未知'}
            </div>
            <div className={styles.V2UploadingStatsMainDel}>
              <IconFont
                className={styles.V2UploadingStatsMainDelIcon}
                iconHref='pc-common-icon-ic_delete'
                onClick={() => {
                  actions.remove();
                }}
              />
            </div>
          </div>
          {
            uploadStatus === 'uploading' ? <Progress className={styles.V2UploadingItemProgress} percent={Number(file.percent)} showInfo={false} strokeWidth={2} strokeColor='#006AFF' /> : undefined
          }
        </div>
      </div>
    );
  };
  const itemRender = (_, file, currFileList, actions) => {
    let fileSrc;
    if (file.response?.key) { // 新上传的视频
      if (file.status === 'done') { // 上传成功
        fileSrc = `${qiniuParams.domain}${file.response.key}`;
      }
    } else {
      fileSrc = file.url;
    }
    return useDragItem ? (
      <DragableUploadListItem
        originNode={(
          <>
            <div className={styles.V2UploadFileItem}>
              {
                showItem(fileSrc, file, actions)
              }
            </div>
          </>
        )}
        file={file}
        fileList={currFileList}
        moveRow={moveRow}
      />
    ) : (
      <div className={styles.V2UploadFileItem}>
        {
          showItem(fileSrc, file, actions)
        }
      </div>
    );
  };
  const MainUpload = (
    <Upload
      className={cs([
        styles.V2UploadFile,
        styles.V2UploadDragWrapper,
        fileList?.length > 5 && styles.V2UploadFileTooMuch
      ])}
      {...props}
      fileList={fileList}
      maxCount={maxCount}
      multiple={multiple}
      name={name}
      beforeUpload={methods.beforeUpload}
      customRequest={methods.customRequest}
      onChange={methods.onChange}
      itemRender={itemRender}
    >
      {/* 超过最大上传数量限制时不显示上传按钮 */}
      {children || (
        <div
          className={cs([
            styles.V2UploadFileBtn,
            fileList?.length && styles.V2UploadFileHasList,
            maxCount && fileList.length >= maxCount && styles.V2UploadFileDisabled,
          ])}
          onClick={(e) => { maxCount && fileList.length >= maxCount && e.stopPropagation(); } }
        >
          <div className={styles.V2UploadFileBtnMain}>
            <UploadOutlined className={cs(styles.V2UploadFileBtnIcon)} />
            <span>添加文件</span>
            <span className={cs(styles.V2UploadFileBtnNum)}>{fileList?.length || 0}/{maxCount}</span>
          </div>
          <div className={styles.V2UploadFileBtnTip}>
            {
              fileTipRender ? fileTipRender({
                size,
                fileType
              }) : `单个文件不超过 ${size}M`
            }
          </div>
        </div>
      )}
    </Upload>
  );
  return (
    <>
      <span ref={uploadRef}>
        {
          useDragItem ? <DndProvider backend={HTML5Backend}>
            {MainUpload}
          </DndProvider> : MainUpload
        }
      </span>
      {
        prevImage.previewVisible && (
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

export default V2UploadFile;
