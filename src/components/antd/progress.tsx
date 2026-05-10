import { Progress as AntProgress } from "antd";
function Progress({ value = 0, className, ...props }: any) { return <AntProgress percent={value} showInfo={false} className={className} {...props} />; }
export { Progress };
