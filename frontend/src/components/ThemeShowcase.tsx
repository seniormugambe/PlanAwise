import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Palette, 
  Sun, 
  Moon, 
  Sparkles, 
  Eye,
  Zap,
  Layers,
  Brush
} from "lucide-react";

export const ThemeShowcase = () => {
  const { theme } = useTheme();

  const themeFeatures = [
    {
      icon: Sun,
      title: "Light Mode",
      description: "Clean, professional design with subtle shadows and gradients",
      color: "text-amber-500"
    },
    {
      icon: Moon,
      title: "Dark Mode", 
      description: "Sophisticated dark theme with neon accents and glow effects",
      color: "text-blue-400"
    },
    {
      icon: Sparkles,
      title: "Premium Gradients",
      description: "Beautiful gradient overlays and smooth color transitions",
      color: "text-purple-500"
    },
    {
      icon: Eye,
      title: "Enhanced Visibility",
      description: "Optimized contrast ratios for better readability",
      color: "text-green-500"
    },
    {
      icon: Zap,
      title: "Smooth Animations",
      description: "Fluid transitions and micro-interactions throughout",
      color: "text-yellow-500"
    },
    {
      icon: Layers,
      title: "Depth & Shadows",
      description: "Layered design with realistic shadow effects",
      color: "text-indigo-500"
    }
  ];

  return (
    <Card className="wallet-card card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gradient-primary">
            <Palette className="w-5 h-5" />
            Theme System
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {theme} mode
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Theme Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themeFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.title}
                className="wallet-card card-interactive p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-primary/10 ${feature.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground text-pretty">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Color Palette Preview */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Brush className="w-4 h-4" />
            Color Palette
          </h4>
          <div className="grid grid-cols-6 gap-2">
            <div className="space-y-1">
              <div className="w-full h-8 bg-primary rounded-md shadow-finance"></div>
              <p className="text-xs text-center text-muted-foreground">Primary</p>
            </div>
            <div className="space-y-1">
              <div className="w-full h-8 bg-success rounded-md shadow-success"></div>
              <p className="text-xs text-center text-muted-foreground">Success</p>
            </div>
            <div className="space-y-1">
              <div className="w-full h-8 bg-warning rounded-md"></div>
              <p className="text-xs text-center text-muted-foreground">Warning</p>
            </div>
            <div className="space-y-1">
              <div className="w-full h-8 bg-destructive rounded-md"></div>
              <p className="text-xs text-center text-muted-foreground">Error</p>
            </div>
            <div className="space-y-1">
              <div className="w-full h-8 bg-accent rounded-md"></div>
              <p className="text-xs text-center text-muted-foreground">Accent</p>
            </div>
            <div className="space-y-1">
              <div className="w-full h-8 bg-muted rounded-md"></div>
              <p className="text-xs text-center text-muted-foreground">Muted</p>
            </div>
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Interactive Elements</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm" className="btn-glow">
              Primary Button
            </Button>
            <Button variant="outline" size="sm">
              Outline Button
            </Button>
            <Button variant="finance" size="sm" className="shadow-finance">
              Finance Button
            </Button>
            <Button variant="ghost" size="sm">
              Ghost Button
            </Button>
          </div>
        </div>

        {/* Gradient Text Examples */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Typography</h4>
          <div className="space-y-1">
            <p className="text-gradient-primary font-bold text-lg">
              Primary Gradient Text
            </p>
            <p className="text-gradient-success font-semibold">
              Success Gradient Text
            </p>
            <p className="text-muted-foreground text-sm">
              Muted foreground text for secondary information
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};