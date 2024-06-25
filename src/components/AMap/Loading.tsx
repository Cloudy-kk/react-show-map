/**
 * @Description 地图loading效果
 */
import { FC, useEffect, useState } from 'react';
import styles from './index.module.less';
// 默认gif，可自定义
const loadingGif = 'https://staticres.linhuiba.com/project-custom/locationpc/map_page_loading.gif'; // map_loading
const Loading: FC<any> = ({
  amapIns, // 地图实例
  gifUrl = loadingGif, // 动画图
  delay = 300 // loading延时取消时间
}) => {
  const [pageLoading, setPageLoading] = useState<boolean>(true); // 默认显示loading

  useEffect(() => {
    if (!amapIns) return;
    setTimeout(() => {
      setPageLoading(false);
    }, delay);
  }, [amapIns]);

  return (
    <>
      {
        pageLoading ? <div className={styles.mapComOfLoadingCon}>
          <img
            src={gifUrl}
            width='100%'
            height='100%' />
        </div> : <></>
      }
    </>
  );
};

export default Loading;
