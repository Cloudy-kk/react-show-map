/**
 * @Description 带有debounce功能的useEffect
 * useEffect会触发页面刷新，导致之前的debounce失效
 */

import { debounce } from '@lhb/func';
import { DependencyList, EffectCallback, useCallback, useEffect, useState } from 'react';

export function useDebounceEffect(
  effect: EffectCallback, // effect回调函数
  deps?: DependencyList, // 依赖项数组
  time = 1000, // 配置防抖的时间
) {
  // 通过设置 flag 标识依赖，只有改变的时候，才会触发 useEffect 中的回调
  const [flag, setFlag] = useState<any>(null);

  // 为函数设置防抖功能，并且缓存函数，当deps[]发生变化的时候触发该函数变化
  const run = useCallback(
    // 防抖功能
    debounce(() => {
      setFlag((state: any) => !state);
    }, time),

    [time]);

  // return run() 会触发run并在下一次执行时销毁上一次的定时器
  useEffect(() => {
    return run();
  }, deps);

  // 只有在 flag 变化的时候，才执行逻辑
  useEffect(() => {
    if (flag !== null) {
      // 执行effect，并执行上一次的return
      return effect();
    }
  }, [flag]);
}

