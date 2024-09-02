import { Badge } from "@/components/ui/badge";

export const MyComponent = () => {
  return (
    <Badge onClick={() => {
      chrome.runtime.sendMessage({ type: 'down', data: "123" });
    }}>aigc</Badge>
  );
};