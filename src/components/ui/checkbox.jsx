import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

const Checkbox = React.forwardRef(
  ({ className, checked, onChange, ...props }, ref) => (
    <div className="relative">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={onChange}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "checked:bg-primary checked:text-primary-foreground",
          className
        )}
        {...props}
      />
      {checked && (
        <Check className="absolute top-0 left-0 h-4 w-4 text-primary-foreground pointer-events-none" />
      )}
    </div>
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
