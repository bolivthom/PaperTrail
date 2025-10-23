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
  const icons = {
    success: <CircleCheckIcon className="me-3 -mt-0.5 inline-flex text-emerald-500" size={16} aria-hidden="true" />,
    error: <AlertCircleIcon className="me-3 -mt-0.5 inline-flex text-red-500" size={16} aria-hidden="true" />,
    info: <InfoIcon className="me-3 -mt-0.5 inline-flex text-blue-500" size={16} aria-hidden="true" />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-[400px] rounded-md border bg-background px-4 py-3 shadow-lg animate-in slide-in-from-top-5">
      <div className="flex gap-2">
        <p className="grow text-sm">
          {icons[type]}
          {message}
        </p>
        <Button
          variant="ghost"
          className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
          aria-label="Close notification"
          onClick={onClose}
        >
          <XIcon
            size={16}
            className="opacity-60 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
}