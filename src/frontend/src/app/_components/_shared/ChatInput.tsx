import { ArrowUp } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group";
import { Box } from "@/components/layout/box";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export interface BaseChatInputProps {
  onSend: (msg: string) => void;
  onFocus?: () => void;
  isDisabled?: boolean;
  placeholder?: string;
  className?: string;
  blockStart?: React.ReactNode;
  blockEnd?: React.ReactNode;
}

export function ChatInput({
  onSend,
  onFocus,
  isDisabled,
  placeholder = "What would you like to know?",
  className,
  blockStart,
  blockEnd,
}: BaseChatInputProps) {
  const [msg, setMsg] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    if (!msg.trim() || isDisabled) return;
    onSend(msg);
    setMsg("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 200); // Max height of 200px
    el.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    if (textareaRef.current) {
      handleInput();
    }
  }, [msg]);

  return (
    <Box className={cn("relative", className)}>
      <InputGroup
        className={cn(
          "rounded-2xl border-2 transition-all duration-300 bg-background/95 backdrop-blur-sm",
          isFocused
            ? "border-primary shadow-lg shadow-primary/10"
            : "border-border hover:border-primary/50",
        )}
      >
        <InputGroupTextarea
          placeholder={placeholder}
          value={msg}
          ref={textareaRef}
          disabled={isDisabled}
          className="min-h-[44px] max-h-[200px]"
          onChange={(e) => {
            setMsg(e.target.value);
          }}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDownCapture={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        {blockStart && (
          <InputGroupAddon align="block-start" className="cursor-auto" >{blockStart}</InputGroupAddon>
        )}
        <InputGroupAddon align="block-end" className="cursor-auto">
          {blockEnd}
          <InputGroupButton
            variant="default"
            className={cn(
              "rounded-full transition-all duration-300",
              msg.trim() && !isDisabled
                ? "bg-primary hover:bg-primary/90 scale-100"
                : "scale-95 opacity-50",
            )}
            size="icon-xs"
            onClick={handleSend}
            disabled={isDisabled || !msg.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Box>
  );
}