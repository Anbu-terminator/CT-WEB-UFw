import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 animate-neon-pulse bg-background/80 backdrop-blur-sm"
    >
      {theme === "light" ? (
        <i className="fas fa-moon text-slate-600" />
      ) : (
        <i className="fas fa-sun text-yellow-400" />
      )}
    </Button>
  );
}
