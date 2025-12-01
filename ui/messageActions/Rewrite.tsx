import { ArrowLeftRight } from "lucide-react";



interface Rewriteprops{
  rewrite: (messagedId: string) => void;
  messageId: string;
};


const Rewrite = ({rewrite,messageId}:Rewriteprops) => {
  return (
    <button
      className="p-2 text-white/70 rounded-xl hover:bg-[#1c1c1c] transition duration-200 hover:text-white"
      onClick={() => rewrite(messageId)}
    >
      <ArrowLeftRight size={18} />
    </button>
  )
}

export default Rewrite