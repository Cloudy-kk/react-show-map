import { get } from '@/common/request';
import { imageTypes, videoTypes } from '../../config-v2';
import type { IToolbarConfig } from '@wangeditor/editor'; // 引入类型
import axios from 'axios';
import V2Message from '../../Others/V2Hint/V2Message';
/* 上传图片有两种方式，请开发根据自身需要使用对应方式 */
const qiniuConfig = {
  bucket: 'linhuiba-certs',
  uploadUrl: '//upload.qiniup.com/',
  cdnUrl: 'https://cert.linhuiba.com/'
};
function getUploadConfig(fileType: string[] | string, size: number) {
  return {
    /* 方式一、通过meta和customInsert */
    // // form-data fieldName ，默认值 'wangeditor-uploaded-image'
    // fieldName: 'file',
    // // 服务端地址，如 '/api/upload'
    // server: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
    // meta: {
    // 'domain': `${QINIU_DOMAIN.image}/`,
    // 'token': qiniuToken.image.token,
    // 'suffix': urlSuffix,
    // },
    // 图片上传大小限制
    // maxFileSize: 10 * 1024 * 1024,
    // // 单次最多上传一个文件
    // maxNumberOfFiles: 1,
    // // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
    // allowedFileTypes: [], // 不限制上传文件类型
    // customInsert(res: any, insertFn: any) {
    //   // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
    //   // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
    //   // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
    //   if (res && res.key) {
    //     // const url = `${QINIU_DOMAIN.image}/${res.key}${this.urlSuffix}`;
    //     const url = '';
    //     insertFn(url);
    //   }
    // },
    /* 方式二、自定义上传 */
    async customUpload(file: File, insertFn: any) {
      if (file) {
        // 上传之前判断格式和大小是否合格
        const type = (file as any).name.split('.').pop().toLowerCase();
        const isCanUpload = fileType.includes(type) || fileType === 'any';
        if (!isCanUpload) {
          V2Message.error('不支持的文件类型，请重新上传');
        }
        const isLimitSize = file.size / 1024 / 1024 < size;
        if (!isLimitSize) {
          V2Message.error(`超出最大文件限制${size}M的大小`);
        }
        // 允许上传
        if (isCanUpload && isLimitSize) {
          const formData = new FormData();
          formData.append('file', file);
          // 获取七牛token
          const result = await get('/qiniu/token', { bucket: qiniuConfig.bucket }, { needCancel: false, proxyApi: '/mirage' });
          if (!result.token) return;
          // 将token添加到上传入参中
          formData.append('token', result.token);
          const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
          };
          // 上传链接
          axios.post(qiniuConfig.uploadUrl, formData, config).then(({ data }) => {
            insertFn(`${qiniuConfig.cdnUrl}${data.key}`);
          }).catch(() => {
            V2Message.error('上传异常，请重试');
          });
        }
      }
    },
  };
}

export function getMenuConf(imageSize: number, videoSize: number) {
  return {
    fontFamily: { // 配置可选字体
      fontFamilyList: [
        'PingFangSC-Regular',
        '宋体',
        '微软雅黑',
        'Arial',
        'Tahoma',
        'Verdana',
      ]
    },
    colors: [
      '#000000',
      '#eeece0',
      '#1c487f',
      '#4d80bf',
      '#c24f4a',
      '#8baa4a',
      '#7b5ba1',
      '#46acc8',
      '#f9963b',
      '#ffffff',
    ],
    // 配置图片上传服务器
    uploadImage: {
      // 视频和图片公用的上传
      ...getUploadConfig(imageTypes, imageSize)
    },
    // 配置视频上传服务器
    uploadVideo: {
      // 视频和图片公用的上传
      ...getUploadConfig(videoTypes, videoSize)
    },
  };
}

// 工具栏配置
export const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'blockquote', // 引用
    'headerSelect', // 标题类型
    'fontFamily', // 字体类型
    // 'fontSize',  // 字体大小
    // 'lineHeight',  // 行高
    '|', // 分割线
    'bold', // 字体加粗
    'underline', // 下划线
    'italic', // 字体倾斜
    'through', // 删除线
    // 'sub',  // 上标
    // 'sup',  // 下标
    'color', // 文字颜色
    'bgColor', // 背景色
    'clearStyle', // 清除格式
    '|', // 分割线
    'bulletedList', // 无序列表
    'numberedList', // 有序列表
    'justifyLeft', // 左对齐
    'justifyRight', // 右对齐
    'justifyCenter', // 居中
    // 'justifyJustify',  // 两端对齐
    '|', // 分割线
    'insertLink', // 插入链接
    'uploadImage', // 上传图片
    'uploadVideo', // 上传视频
    'insertTable', // 插入表格
    '|', // 分割线
    'undo', // 取消
    'redo', // 重做
    // 'indent',  // 增加缩进
    // 'delIndent',  // 减少缩进
    // 'divider',  // 插入分割线
    // 'todo',  // 待办
    // "deleteTable",  // 删除表格
    // "insertTableRow",  // 插入表格行
    // "deleteTableRow",  // 删除表格行
    // "insertTableCol",  // 插入表格列
    // "deleteTableCol",  // 删除表格列
    // "emotion",  // 插入表情符号
    // 'codeBlock',  // 代码块
    // "insertImage",  // 插入网络图片
    // "deleteImage",  // 删除图片
    // "editImage",  // 编辑图片
    // "viewImageLink",  // 查看图片链接
    // "imageWidth30",  // 图片宽度设置为30%
    // "imageWidth50",  // 图片宽度设置为50%
    // "imageWidth100",  // 图片宽度设置为100%
    // "editLink",  // 修改链接
    // "unLink",  // 删除链接
    // "viewLink",  // 查看链接
    // 'fullScreen',  // 全屏
  ]
};
