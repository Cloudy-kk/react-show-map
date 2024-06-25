/* 上传 */
import React, { useEffect, useRef, useState } from 'react';
import styles from './upload.module.less';
import cs from 'classnames';
import { Progress, Upload } from 'antd';
import { CloseCircleFilled, PlusOutlined, WarningFilled } from '@ant-design/icons';
import { Bucket, bucketMappingDomain, bucketMappingActionUrl, qiniuTokenUrl, qiniuTokenExtraConfig } from '../../config-v2';
import axios from 'axios';
import { get } from '@/common/request';
import { useMethods } from '@lhb/hook';
import V2VideoPlayer from '../../Data/V2VideoPlayer';
import { CombineUploadProps } from './props';
import { floorKeep } from '@lhb/func';
import V2Message from '../../Others/V2Hint/V2Message';
export interface V2UploadVideoProps extends CombineUploadProps {
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
   * @description 额外的校验，(file: any) => new Promise(res). res传入false时，代表校验通过。传入string时，代表失败，并会报错
   */
  extraVerified?: (file: any) => Promise<string | boolean>;
  /**
   * @description 内部方法，不外露
   */
  onCustomChange?: Function;
}

const V2UploadVideo: React.FC<V2UploadVideoProps> = ({
  size = 10,
  name,
  maxCount = 1,
  multiple = false,
  fileType = [],
  showSuccessMessage = true,
  children,
  qiniuParams = {
    domain: bucketMappingDomain[Bucket.Default],
    bucket: Bucket.Default,
  },
  extraVerified,
  ...props
}) => {
  const uploadRef: any = useRef();
  const [fileList, setFileList] = useState<any[]>([]);
  const [cacheTotal, setCacheTotal] = useState<number>(0);

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
    }
  });
  /* components */
  const showItem = (url, file, actions) => {
    const uploadStatus = file.status;
    // 如果是默认插入的图片、新上传并以成功的、删除进行中的就使用这套样式
    if (!uploadStatus || uploadStatus === 'done' || uploadStatus === 'removed') {
      return (
        <>
          <div>
            <V2VideoPlayer src={url} height={112} width={200} styleType='young' pictureInPictureToggle={false}/>
          </div>
          <span
            className={styles.V2UploadImageCloseSpan}
            onClick={(e) => {
              e.stopPropagation();
              actions.remove();
            }}
          >
            <CloseCircleFilled className={styles.V2UploadImageClose} style={{ fontSize: '14px' }}/>
          </span>
        </>
      );
    } else if (uploadStatus === 'error') { // 如果是上传错误的就用这套样式
      return (
        <div className={cs(styles.V2UploadingStatsItem, styles.V2UploadingError)}>
          <WarningFilled className={styles.V2UploadingErrorIcon}/>
          <div className={styles.V2UploadingItemProgressTip}>失败</div>
        </div>
      );
    } else if (uploadStatus === 'uploading') { // 如果是上传进行中的就用这套样式
      return (
        <div className={styles.V2UploadingStatsItem}>
          <Progress className={styles.V2UploadingItemProgress} percent={Number(file.percent)} showInfo={false} strokeWidth={4} strokeColor='#006AFF' />
          <div className={styles.V2UploadingItemProgressTip}>上传中</div>
        </div>
      );
    }
    return undefined;
  };
  const itemRender = (_, file, __, actions) => {
    let videoSrc;
    if (file.response?.key) { // 新上传的视频
      if (file.status === 'done') { // 上传成功
        videoSrc = `${qiniuParams.domain}${file.response.key}`;
      }
    } else { // 默认插入的老图片
      videoSrc = file.url;
    }
    return (
      <div className={styles.V2UploadImageItem}>
        {
          showItem(videoSrc, file, actions)
        }
      </div>
    );
  };
  return (
    <>
      <Upload
        className={cs(styles.V2UploadImage, styles.V2UploadVideo)}
        {...props}
        listType='picture-card'
        maxCount={maxCount}
        multiple={multiple}
        name={name}
        beforeUpload={methods.beforeUpload}
        customRequest={methods.customRequest}
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
    </>
  );
};

export default V2UploadVideo;
