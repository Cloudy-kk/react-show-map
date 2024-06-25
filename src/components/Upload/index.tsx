/**
 * 上传
 * 如需在父组件获取上传列表，传onChange
 */
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';
import { Upload, message, Image } from 'antd';
import { getQiNiuToken } from '@/common/api/common';
import { EditOutlined } from '@ant-design/icons';
import { CombineUploadProps } from './ts-config';
import { Bucket, bucketMappingDomain, bucketMappingActionUrl } from '@/common/enums/qiniu';
import TemplateUpload from '@/common/components/business/Template/Upload';
import axios from 'axios';
import IconFont from '@/common/components/IconFont';

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// 图片的格式
const ImageType = ['png', 'jpg', 'gif', 'jpeg', 'bmp'];

const CustomerUpload: React.FC<CombineUploadProps> = ({
  listType = 'picture-card', // 上传列表的内建样式，支持三种基本样式 text, picture 和 picture-card
  maxCount, // maxCount为1时后面上传的会覆盖前面上传的
  multiple = false, // 是否开启多选，默认为false
  openFileDialogOnClick = true, // 点击打开文件对话框
  name,
  width,
  height,
  size = 10, // 上传大小 单位 M
  fileType = ImageType, // 可以上传的类型-默认为图片
  previewFile, // 自定义预览事件
  onPreview, // 点击文件链接或预览图标时的回调
  isPreviewImage = false,
  qiniuParams = {
    domain: bucketMappingDomain['linhuiba-certs'],
    bucket: Bucket.Certs,
  },
  showSuccessMessage = true,
  children,
  onlyEdit = false, // 是否只能编辑，不能上传,此项true时，只能上传一个文件，删除按钮会变成编辑按钮
  ...props
}) => {
  if (onlyEdit) { // 只要是不能删除，只能编辑的，就把上传上线限制到1个
    maxCount = 1;
  }
  const uploadRef: any = useRef();
  const [fileList, setFileList] = useState<any[]>([]);
  const [prevImage, setPrevImage] = useState<any>({
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
  });

  useEffect(() => {
    props?.fileList && Array.isArray(props.fileList) && setFileList(props.fileList);
  }, [props.fileList]);

  // 图片尺寸验证
  const checkImageWH = (file, width, height) => { // 参数分别是上传的file，想要限制的宽，想要限制的高
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
  };
  // 上传前限制
  const beforeUpload = async (file) => {
    const type = file.type.split('/')[1];
    const isCanUpload = fileType.includes('*') ? true : fileType.includes(type);
    if (!isCanUpload) {
      message.error('不支持的文件类型，请重新上传');
      // 返回false依旧会触发onChange事件，将不符合条件的文件上传，返回Upload.LIST_IGNORE则不会
      return Upload.LIST_IGNORE;
    }
    const isLimitSize = file.size / 1024 / 1024 < size;
    if (!isLimitSize) {
      message.error(`超出最大文件限制${size}M的大小`);
      return Upload.LIST_IGNORE;
    }
    let isWH: any = true;
    if (width && height) {
      try {
        isWH = await checkImageWH(file, width, height);
        if (!isWH) {
          message.error(`超出${width}*${height}的大小`);
          return Upload.LIST_IGNORE;
        }
      } catch (error) {
        message.error(`图片加载失败！`);
      }
    }
    return isCanUpload && isLimitSize && isWH;
  };

  // 上传状态改变
  const onChange = (file) => {
    setFileList(file.fileList);
    props?.onChange?.(file.fileList);
    // 上传中
    // if (file.file.status !== 'uploading') {
    // }
    if (file.file.status === 'done') {
      // 上传成功
      showSuccessMessage && message.success(`${file.file.name} 上传成功`);
      const arr = file.fileList.map((item: any) => ({
        name: item.name,
        uid: item.uid,
        status: 'done',
        url: item.url || `${qiniuParams.domain}${item.response.key}`,
      }));
      setFileList(arr);
      props?.onChange?.(arr);
    } else if (file.file.status === 'error') {
      // 上传失败
      message.error(`${file.file.name} 上传失败.`);
    } else if (file.file.status === 'removed') {
      // 移除图片
      props?.onChange?.(file.fileList);
    }
  };

  // 自定义上传事件
  const customRequest = async ({ onError, onSuccess, onProgress, file, withCredentials, headers }: any) => {
    const formData = new FormData();
    formData.append('file', file);
    // 获取七牛token
    const { token } = await getQiNiuToken({ bucket: qiniuParams.bucket });
    if (!token) return;
    // 将token添加到上传入参中
    formData.append('token', token);
    const config = {
      withCredentials,
      headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      onUploadProgress: ({ total, loaded }) => {
        onProgress({ percent: Math.round((loaded / total) * 100).toFixed(2) }, file);
      },
    };
    // 上传链接
    const upUrl = bucketMappingActionUrl[qiniuParams.bucket];
    axios
      .post(upUrl, formData, config)
      .then(({ data }) => {
        onSuccess(data, file);
      })
      .catch(onError);
    return {
      abort() {
        console.log('upload progress is aborted.');
      },
    };
  };

  const handlePreview = async (file) => {
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
      window.open(file.url || file.preview);
    }
  };

  const handleCancel = () => {
    setPrevImage({ previewVisible: false });
  };

  const onRemove = () => {
    if (onlyEdit) { // 仅编辑时，对onRemove进行重塑
      uploadRef.current.upload.uploader.onClick();
    }
    return !onlyEdit; // 若是仅编辑，就不再执行remove操作
  };

  return (
    <>
      <Upload
        beforeUpload={beforeUpload}
        {...props}
        listType={listType}
        maxCount={maxCount}
        multiple={multiple}
        name={name}
        openFileDialogOnClick={openFileDialogOnClick}
        customRequest={customRequest}
        previewFile={previewFile}
        onPreview={onPreview || handlePreview}
        onChange={onChange}
        onRemove={onRemove}
        showUploadList={{
          removeIcon: onlyEdit ? <div title='修改文件' style={{ height: '22px', background: 'transparent' }}><EditOutlined className={styles.editIcon} /></div> : undefined
        }}
        ref={uploadRef}
        iconRender={() => <IconFont iconHref='icon-yunshangchuan' className={styles.iconSize}/>}
      >
        {/* 超过最大上传数量限制时不显示上传按钮 */}
        {maxCount && fileList.length >= maxCount ? null : children || <TemplateUpload text='上传'/>}
      </Upload>
      {prevImage.previewVisible && (
        <Image
          width={200}
          style={{ display: 'none' }}
          preview={{
            visible: prevImage.previewVisible,
            src: prevImage.previewImage,
            onVisibleChange: () => {
              handleCancel();
            },
          }}
        />
      )}
    </>
  );
};

export default CustomerUpload;
