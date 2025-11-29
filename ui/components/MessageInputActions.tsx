import { CopyPlus, ScanEye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";

interface CopilotProps {
  copilotEnabled: boolean;
  setCopilotEnabled: (enabled: boolean) => void;
}

export const Attach = () => {
  return (
    <button
      type="button"
      className="p-2 text-white/50 rounded-xl hover:bg-[#1c1c1c] transition duration-200 hover:text-white"
    >
      <CopyPlus />
    </button>
  );
};

export const Focus = () => {
  return (
    <button
      type="button"
      className="p-2 text-white/50 rounded-xl hover:bg-[#1c1c1c] transition duration-200 hover:text-white"
    >
      <ScanEye />
    </button>
  );
};

export const CopilotToggle = ({copilotEnabled,setCopilotEnabled}: CopilotProps) => {
  return (
    <div className="group flex flex-row items-center spaxe-x-1 active:scale-95 duration-200 transition cursor-pointer">
      <label className="flex items-center gap-2 cursor-pointer">
        <Switch
          checked={copilotEnabled}
          onCheckedChange={setCopilotEnabled}
          className="bg-[#111111] border border-[#1C1C1C] data-[state=checked]:bg-[#24A0ED] relative inline-flex h-5 w-10 sm:h-6 sm:w-11 items-center rounded-full"
        />
        <span
          className={cn(
            "text-[10px] font-medium transition-colors duration-400 ease-in-out",
            copilotEnabled
              ? "text-[#24A0ED]"
              : "text-white/50 group-hover:text-white"
          )}
        >
          Copilot
        </span>
      </label>
    </div>
  );
};
