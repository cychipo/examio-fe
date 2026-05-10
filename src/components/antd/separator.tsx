import { Divider } from "antd";
function Separator({ orientation = "horizontal", className, ...props }: any) { return <Divider type={orientation === "vertical" ? "vertical" : "horizontal"} className={className} {...props} />; }
export { Separator };
