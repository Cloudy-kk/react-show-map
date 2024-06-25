/*
* version: 当前版本2.11.7
*/
import V2Notification from './V2Notification';
import V2Message from './V2Message';

interface V2HintComponent {
  V2Notification: typeof V2Notification;
  V2Message: typeof V2Message;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/others/v2hint
*/
const V2Hint: V2HintComponent = () => {
  return <></>;
};

V2Hint.V2Notification = V2Notification;
V2Hint.V2Message = V2Message;

export default V2Hint;
