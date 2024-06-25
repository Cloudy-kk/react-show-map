import { FC, useEffect, useState } from 'react';
import { isMobile, urlParams } from '@lhb/func';
import './index.module.less';
const ClusterChart: FC<{
  _mapIns?: any,
  clusterData: any;
  onMouseover?: Function;
  onMouseout?: Function;
  labelMarker?: any;
  fieldNames?: any;
  colorMap?: any;
  itemFieldNames?: any;
  zooms?: number[];
  showImg?: boolean;
  showColor?:boolean;
}> = ({
  _mapIns,
  clusterData,
  onMouseover,
  onMouseout,
  labelMarker,
  fieldNames,
  colorMap,
  itemFieldNames,
  zooms = [2, 20],
  showImg = false,
  showColor = false
}) => {
  const isShare = urlParams(location.search)?.isShare;

  const [groupIns, setGroupIns] = useState<any>(null); // 存储聚合点
  // 一级属性的key映射
  const circleChildrenKey = fieldNames && fieldNames.childrenKey ? fieldNames.childrenKey : 'data';
  const circleName = fieldNames && fieldNames.name ? fieldNames.name : 'name';
  const circleTotal = fieldNames && fieldNames.total ? fieldNames.total : 'total';
  // 二级属性的key映射
  const itmeLogo = itemFieldNames && itemFieldNames.logo ? itemFieldNames.logo : 'logo';
  useEffect(() => {
    if (!_mapIns) return;
    const group = new window.AMap.OverlayGroup();
    _mapIns.add(group);
    setGroupIns(group);
  }, [_mapIns]);
  useEffect(() => {
    if (!groupIns) return;
    drawCluster(clusterData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterData, groupIns, colorMap]);
  // 绘制聚合圈
  const drawCluster = (clusterData) => {
    groupIns.clearOverlays();
    const markerList: any = [];
    clusterData.forEach((cluster) => {
      let lDeg = 0;
      let rDeg = 0;
      const total = cluster[circleTotal];
      let styleList: any = [];
      // 先计算每个圈的占比样式
      if (total !== 0) {
        styleList = cluster[circleChildrenKey].map(item => {
          // 计算出每个选中的条目在所有选中项中的比重
          item.scale = item.total / total;
          rDeg = rDeg + 360 * item.scale;
          const res = `${colorMap[item.id] || 'white'} ${lDeg}deg ${rDeg}deg`;
          lDeg = rDeg;
          return res;
        });
      }
      const content = `<div style='background: conic-gradient(${styleList.join(',')});' class='circlebox'>
    <div class='whiteBg'><p class='text-name '>${cluster[circleName]}</p><p class='text-total'>${cluster[circleTotal]}</p></div>
    </div>`;
      // 生成聚合圈
      const marker = new window.AMap.Marker({
        zooms: zooms,
        content: content,
        anchor: 'center',
        bubble: true,
        zIndex: cluster[circleTotal] < 1 ? 8 : 9,
        position: [cluster.lng, cluster.lat],
      });
      marker.on('mouseover', () => {
        if (labelMarker) {
          let labelContent = `<div class='label'>`;
          cluster[circleChildrenKey]?.forEach(item => {
            labelContent += `<div class='item'>
            ${showColor ? `<div class='color' style="background:${item.color};"></div>` : ''}
              ${showImg ? (`<div>
                                <img src=${item[itmeLogo] && item[itmeLogo] !== '' ? item[itmeLogo] : 'https://staticres.linhuiba.com/project-custom/locationpc/img_placeholder.png'} />
                            </div>`) : ''}
              <div>
                <span>
                ${item?.shortName || item.name}：${item.total} | ${total === 0 ? '0' : (item.scale * 100).toFixed(2)}%
                </span>
              </div>
          </div>`;
          });
          labelContent += '</>';
          labelMarker.setMap(_mapIns);
          labelMarker.setPosition([cluster.lng, cluster.lat]);
          labelMarker.setContent(labelContent);
          labelMarker.setOffset(new window.AMap.Pixel(-34, 38));
        }
        onMouseover && onMouseover(cluster);
      });

      marker.on('mouseout', () => {
        if (labelMarker) {
          labelMarker.setContent(' ');
          labelMarker.setOffset(new window.AMap.Pixel(-34, 6));
        }
        onMouseout && onMouseout();
      });

      if (isMobile() && isShare) {
        marker.on('click', () => {
          if (labelMarker) {
            let labelContent = `<div class='label'>`;
            cluster[circleChildrenKey]?.forEach(item => {
              labelContent += `<div class='item'>
                ${showImg ? (`<div>
                                  <img src=${item[itmeLogo] && item[itmeLogo] !== '' ? item[itmeLogo] : 'https://staticres.linhuiba.com/project-custom/locationpc/img_placeholder.png'} />
                              </div>`) : ''}
                <div>
                  <span>${item.name}：${item.total} | ${total === 0 ? '0' : (item.scale * 100).toFixed(2)}%</span>
                </div>
            </div>`;
            });
            labelContent += '</>';
            labelMarker.setMap(_mapIns);
            labelMarker.setPosition([cluster.lng, cluster.lat]);
            labelMarker.setContent(labelContent);
            labelMarker.setOffset(new window.AMap.Pixel(-34, 38));
          }
          onMouseover && onMouseover(cluster);

          setTimeout(() => {
            if (labelMarker) {
              labelMarker.setContent(' ');
              labelMarker.setOffset(new window.AMap.Pixel(-34, 6));
            }
            onMouseout && onMouseout();
          }, (3000));
        });
      }

      markerList.push(marker);
    });
    groupIns.addOverlays(markerList);
  };
  return <></>;
};

export default ClusterChart;
