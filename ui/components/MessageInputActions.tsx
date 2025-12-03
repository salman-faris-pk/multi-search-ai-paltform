import { CopyPlus, Globe, Pencil,ScanEye, SwatchBook } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";
import { SiYoutube, SiReddit } from "@icons-pack/react-simple-icons";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { Fragment } from "react";

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




const focusModeItems = [
  {
    key: "webSearch",
    title: "Explore",
    description: "Searches across all of the internet",
    icon: <Globe size={20} />,
  },
  {
    key: "academicSearch",
    title: "Academic",
    description: "Search in published academic papers",
    icon: <SwatchBook size={20} />,
  },
  {
    key: "writingAssistant",
    title: "Writing",
    description: "Chat without searching the web",
    icon: <Pencil size={16} />,
  },
  {
    key: "youtubeSearch",
    title: "Youtube",
    description: "Search and watch videos",
    icon: (
      <SiYoutube
        className="h-5 w-auto mr-0.5"
        onPointerEnter={undefined}
        onPointerLeave={undefined}
      />
    ),
  },
  {
    key: "redditSearch",
    title: "Reddit",
    description: "Search for discussions and opinions",
    icon: (
      <SiReddit
        className="h-5 w-auto mr-0.5"
        onPointerEnter={undefined}
        onPointerLeave={undefined}
      />
    ),
  },
];




export const Focus = ({
  focusMode,
  setFocusMode
}: {
  focusMode: string;
  setFocusMode: (mode: string) => void;
}) => {
  return (
    <Popover className="relative">
      <PopoverButton 
        type="button"
        className={
          "p-2 text-white/50 active:scale-95 rounded-xl hover:bg-[#1c1c1c] transition duration-200 hover:text-white flex items-center justify-center"
        }
      >
        {focusMode !== "webSearch" ? (
          <div className="flex flex-row items-center space-x-1">
            {focusModeItems.find((mode) => mode.key === focusMode)?.icon}
            <p className="text-xs font-medium">
              {focusModeItems.find((mode) => mode.key === focusMode)?.title}
            </p>
          </div>
        ) : (
          <ScanEye />
          
        )}
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute left-0 top-full mb-2 z-10 w-[242px] md:w-[322px] lg:w-[412px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-[#0A0A0A] border border-[#1c1c1c] rounded-lg w-full p-2 max-h-[200px] md:max-h-none overflow-y-auto custom-scroll">
            {focusModeItems.map((mode, i) => (
              <PopoverButton
                onClick={() => setFocusMode(mode.key)}
                key={i}
                className={cn(
                  "p-2 rounded-lg flex flex-col items-center justify-start text-start space-y-2 duration-100 cursor-pointer transition",
                  focusMode == mode.key ? "bg-[#111111]" : "hover:bg-[#111111]"
                )}
              >
                <div
                  className={cn(
                    "flex flex-row items-center space-x-1",
                    focusMode === mode.key ? "text-[#24A0ED]" : "text-white"
                  )}
                >
                  {mode.icon}
                  <p className="text-sm font-medium">{mode.title}</p>
                </div>

                <p className="text-white/70 text-[10px]">{mode.description}</p>

              </PopoverButton>
            ))}
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
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
