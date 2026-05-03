import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
        <div className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-9 h-9 p-0 hover:bg-accent/50 hover:scale-110 transition-all duration-300 focus-ring"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 transition-all duration-500 rotate-0 scale-100 hover:rotate-12" />
      ) : (
        <Sun className="w-4 h-4 transition-all duration-500 rotate-0 scale-100 hover:rotate-180" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};