// import { CircleCheckIcon, XIcon, AlertCircleIcon, InfoIcon } from "lucide-react";
// import { Button } from "./ui/button";

// interface NotificationProps {
//   message: string;
//   type?: "success" | "error" | "info";
//   onClose: () => void;
// }

// export function Notification({ message, type = "success", onClose }: NotificationProps) {
//   const icons = {
//     success: <CircleCheckIcon className="me-3 -mt-0.5 inline-flex text-emerald-500" size={16} aria-hidden="true" />,
//     error: <AlertCircleIcon className="me-3 -mt-0.5 inline-flex text-red-500" size={16} aria-hidden="true" />,
//     info: <InfoIcon className="me-3 -mt-0.5 inline-flex text-blue-500" size={16} aria-hidden="true" />,
//   };

//   return (
//     <div className="fixed bottom-4 right-4 z-50 max-w-[400px] rounded-md border bg-background px-4 py-3 shadow-lg animate-in slide-in-from-bottom-5">
//       <div className="flex gap-2">
//         <p className="grow text-sm">
//           {icons[type]}
//           {message}
//         </p>
//         <Button
//           variant="ghost"
//           className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
//           aria-label="Close notification"
//           onClick={onClose}
//         >
//           <XIcon
//             size={16}
//             className="opacity-60 transition-opacity group-hover:opacity-100"
//             aria-hidden="true"
//           />
//         </Button>
//       </div>
//     </div>
//   );
// }

import { CircleCheckIcon, XIcon, AlertCircleIcon, InfoIcon } from "lucide-react";
import { Button } from "./ui/button";

interface NotificationProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export function Notification({ message, type = "success", onClose }: NotificationProps) {
  const styles = {
    success: {
      container: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
      iconBg: "bg-emerald-100 dark:bg-emerald-900",
      icon: <CircleCheckIcon className="text-emerald-600 dark:text-emerald-400" size={20} aria-hidden="true" />,
      text: "text-emerald-900 dark:text-emerald-100",
    },
    error: {
      container: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
      iconBg: "bg-red-100 dark:bg-red-900",
      icon: <AlertCircleIcon className="text-red-600 dark:text-red-400" size={20} aria-hidden="true" />,
      text: "text-red-900 dark:text-red-100",
    },
    info: {
      container: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-100 dark:bg-blue-900",
      icon: <InfoIcon className="text-blue-600 dark:text-blue-400" size={20} aria-hidden="true" />,
      text: "text-blue-900 dark:text-blue-100",
    },
  };

  const currentStyle = styles[type];

  return (
    <div className={`fixed bottom-4 right-4 left-4 sm:left-auto z-50 sm:max-w-[400px] rounded-lg border ${currentStyle.container} shadow-xl animate-in slide-in-from-bottom-5 backdrop-blur-sm`}>
      <div className="flex items-start gap-3 p-4">
        {/* Icon with background */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${currentStyle.iconBg} flex items-center justify-center`}>
          {currentStyle.icon}
        </div>
        
        {/* Message */}
        <div className="flex-1 pt-0.5">
          <p className={`text-sm font-medium leading-relaxed ${currentStyle.text}`}>
            {message}
          </p>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className={`-mt-1 -mr-1 h-8 w-8 rounded-md hover:bg-black/5 dark:hover:bg-white/10 ${currentStyle.text}`}
          aria-label="Close notification"
          onClick={onClose}
        >
          <XIcon size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}