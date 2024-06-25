/*
* version: 当前版本2.10.8
*/
import React, { useRef, useEffect, forwardRef, useImperativeHandle, ForwardedRef, MutableRefObject } from 'react';
import styles from './index.module.less';
import cs from 'classnames';
import videojs from 'video.js';
import 'video.js/dist/video-js.min.css';
import { isMicro, getCss } from '../../config-v2';
export interface V2VideoHandles {
  /**
   * @description video实例，请查看文档 https://docs.videojs.com/audiotrack#event
   */
  video: MutableRefObject<any>;
  /**
   * @description 更新src地址
   */
  replaceSrc: (src: string) => void;
}
export interface V2VideoPlayerProps {
  /**
   * @description 视频地址
   */
  src: string;
  /**
   * @description 视频模块宽度
   * @default 300px
   */
  width?: string | number;
  /**
   * @description 视频模块高度
   * @default 300px
   */
  height?: string | number;
  /**
   * @description videojs配置项，详情请查看 https://docs.videojs.com/#options
   */
  options?: any;
  /**
   * @description 样式模式, 默认 标准模式
   * @type ['base' | 'young']
   * @default base
   */
  styleType?: string;
  /**
   * @description 是否支持画中画播放
   */
  pictureInPictureToggle?: boolean;
  /**
   *@description ref实例
   */
  ref?: any;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/Data/v2video-player
*/
const V2VideoPlayer: React.FC<V2VideoPlayerProps> = forwardRef(({
  src,
  width = '300px',
  height = '300px',
  options = {},
  styleType,
  pictureInPictureToggle = true
}, ref: ForwardedRef<V2VideoHandles>) => {
  const videoRef = useRef<any>(null);
  const playerRef = useRef<any>(null);

  const onReadyPlay = (palyer) => {
    videoRef.current = palyer;
    // palyer.play();
  };

  const init = () => {
    const _children: any[] = [
      { name: 'playToggle' }, // 播放按钮
      {
        name: 'volumePanel', // 音量控制
        inline: false, // 不使用水平方式
      },
      { name: 'currentTimeDisplay' }, // 当前已播放时间
      // { name: 'durationDisplay' }, // 总时间
      { name: 'progressControl' }, // 播放进度条
    ];
    if (pictureInPictureToggle) {
      _children.push({
        name: 'pictureInPictureToggle'// 支持画中画
      });
    }
    _children.push({
      name: 'FullscreenToggle'// 支持全屏，
    });
    const _option = {
      controls: true,
      // notSupportedMessage: '此视频暂无法播放，当前仅支持mp4，ogg，webm，mpeg4 格式',
      controlBar: {
        // timeDivider: true,//是否显示时间控制条，默认为true
        // remainingTimeDisplay: false,//是否显示剩余时间，默认为true
        fullscreenToggle: false, // 全屏按钮
        children: _children
      }
    };
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;
      const player = playerRef.current = videojs(videoElement, Object.assign(_option, options), () => {
      });
      onReadyPlay(player);
    }
  };

  const replaceSrc = (newSrc: string) => {
    videoRef.current?.src?.([
      { src: newSrc, type: 'video/mp4' },
      { src: newSrc, type: 'video/ogg' },
      { src: newSrc, type: 'video/webm' },
      { src: newSrc, type: 'video/mpeg4' },
    ]);
  };

  useImperativeHandle(ref, () => ({
    video: videoRef, // 不能videoRef.current
    replaceSrc: replaceSrc
  }));
  useEffect(() => {
    if (isMicro) {
      if ((window as any).__POWERED_BY_QIANKUN__) {
        setTimeout(() => {
          getCss('videoJS', 'html');
        });
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (<div
    className={cs([
      styles.V2VideoPlayer,
      styleType === 'young' && styles.V2VideoPlayerYoung,
    ])}
    style={{
      width,
      height,
    }}
  >
    <video
      style={{ height: '100%', width: '100%' }}
      ref={videoRef}
      className='video-js vjs-big-play-centered'
    >
      <source src={src} type='video/mp4' />
      <source src={src} type='video/ogg'/>
      <source src={src} type='video/webm'/>
      <source src={src} type='video/mpeg4'/>
    </video>
  </div>);
});

export default V2VideoPlayer;
