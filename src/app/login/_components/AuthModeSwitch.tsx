import { HStack } from "@/components/layout/hstack";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthMode = "login" | "signup";

interface AuthModeSwitchProps {
  authMode: AuthMode;
  disabled?: boolean;
  onChangeMode: (mode: AuthMode) => void;
}

export function AuthModeSwitch({
  authMode,
  disabled,
  onChangeMode,
  ...props
}: AuthModeSwitchProps & { children: React.ReactNode }) {
  return (
    <Tabs
      defaultValue={authMode}
      onValueChange={(value) => onChangeMode(value as AuthMode)}
      className="w-full"
    >
      <TabsList className="bg-transparent border-b-2 border-muted/50 justify-start w-full">
        <TabsTrigger
          value="login"
          disabled={disabled}
          className="data-[state=active]:border-primary data-[state=active]:border-b-2"
        >
          Login
        </TabsTrigger>
        <TabsTrigger
          value="signup"
          disabled={disabled}
          className="data-[state=active]:border-primary data-[state=active]:border-b-2"
        >
          Signup
        </TabsTrigger>
      </TabsList>
      {props.children}
    </Tabs>
  );
}
