import { Clock, Edit, Share, Trash } from "lucide-react";
import { Message } from "./ChatWindow";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatTimeDifference } from "@/lib/utils";

const Navbar = ({ messages }: { messages: Message[] }) => {

  const [currentTime, setCurrentTime] = useState(() => new Date());

  const title = useMemo(() => {
    if (messages.length === 0) return "";
    const content = messages[0].content || "";
    return content.length > 20
      ? `${content.substring(0, 20).trim()}...`
      : content;
  }, [messages]);

   useEffect(() => {
     const intervalId = setInterval(() => {
       setCurrentTime(new Date());
     }, 30000);

     return () => clearInterval(intervalId);
   }, []);

   const timeAgo = useMemo(() => {
     if (messages.length === 0) return "";
     return formatTimeDifference(currentTime, messages[0].createdAt!);
   }, [messages, currentTime]);


  return (
    <div className="fixed text-white/70 z-40 top-0 left-0 right-0 px-4 lg:pl-[104px] lg:pr-6 lg:px-8 flex flex-row items-center justify-between w-full py-4 text-sm border-b bg-[#0A0A0A] border-[#1C1C1C]">
      <Edit
        size={17}
        className="active:scale-95 transition duration-100 cursor-pointer lg:hidden"
      />
      <div className="hidden lg:flex flex-row items-center justify-center space-x-2">
        <Clock size={17} />
        <p className="text-xs">{timeAgo} ago</p>
      </div>
      <p className="hidden lg:flex">{title}</p>
      <div className="flex flex-row space-x-4 items-center">
        <Share
          size={17}
          className="active:scale-95 transition duration-100 cursor-pointer"
        />
        <Trash
          size={17}
          className="active:scale-95 transition duration-100 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Navbar;
