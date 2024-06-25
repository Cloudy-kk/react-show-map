import { CSSProperties, FC, useEffect, useState } from 'react';
import IconFont from '@/common/components/IconFont';
import styles from './index.module.less';
import cs from 'classnames';
import { Button, message, Modal } from 'antd';
import { getTenantInfo } from '@/common/api/system';
import { getCityIds, getLink } from '@/common/api/common';
import copy from 'copy-to-clipboard';

// 分享
const Share: FC<{
  _mapIns?: any;
  style?: CSSProperties;
  className?: string;
  URLParamsRef:any;
  setSelected:Function;
}> = ({
  _mapIns,
  style,
  className,
  URLParamsRef,
  setSelected
}) => {
  const { lng, lat } = _mapIns?.getCenter() || {};
  const zoom = _mapIns?.getZoom() || 0;
  const [show, setShow] = useState<boolean>(false);
  const [tenantId, setTenantId] = useState<any>(null);
  const [shortUrl, setShortUrl] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');


  const copyUrl = () => {
    // 如果接口还没请求完
    if (!isMounted) {
      message.error('链接正在生成中，请稍后');
      return;
    }
    copy(shortUrl);
    message.success('该链接已复制到剪切板上！');
    setShow(false);
    setSelected((state) => state - 1);
  };
  const handleClick = () => {
    if (URLParamsRef?.current?.limit === 0) {
      setShow(true);
      setSelected((state) => state + 1);
    } else {
      message.error('暂未包含所选点位信息～');
    }
  };
  const handleUrl = async() => {
    // 获取cityIds并拼接到params
    const { cityIds } = await getCityIds();
    const href = location.href.split('/industry')[0].concat('/shareindustry');

    const params = JSON.stringify({
      ...URLParamsRef?.current,
      lng,
      lat,
      zoom,
      tenantId,
      cityIds
    });
    const url = process.env.NODE_ENV === 'development'
      ? `${href}?isShare=true&params=${params}`
      : `${process.env.CONSOLE_PC_URL}/selection/shareindustry?isShare=true&params=${params}`;
    setUrl(url);
  };
  useEffect(() => {
    if (!_mapIns) return;
    _mapIns.addLayer(new window.AMap.TileLayer.Satellite({ visible: false }));
  }, [_mapIns]);
  useEffect(() => {
    getTenantInfo().then(({ id }) => {
      setTenantId(id);
    });
  }, []);
  useEffect(() => {
    // 分享框展示的情况才需要调用api获取短链接
    // 获取cityIds，保证服务端分享后的数据权限逻辑
    if (show) {
      handleUrl();
    }
    if (!show) {
      setIsMounted(false);
      setUrl('');
    }
  }, [show]);

  useEffect(() => {
    if (url) {
      getLink({ url: encodeURI(url) }).then((val) => {
        setShortUrl(val.url);
      });
      setIsMounted(true);
    }
  }, [url]);

  return (
    <>
      <div
        className={
          cs(styles.satellite,
            className,
            'bg-fff pointer selectNone',
            'c-132')
        }
        onClick={handleClick}
        style={style} >
        <IconFont
          iconHref='iconlist_ic_share_normal'
          style={{ width: '16px', height: '16px' }} />
        <span className='inline-block ml-5'>分享</span>

      </div>

      <Modal
        title='分享链接'
        open={show}
        onCancel={() => { setShow(false); setSelected((state) => state - 1); }}
        footer={[
          <Button key='copy' type='primary'onClick={copyUrl}>复制链接</Button>
        ]}
      >
        <p>{shortUrl}</p>
      </Modal>

    </>);
};

export default Share;
