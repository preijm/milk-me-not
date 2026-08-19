import { Heading, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


const ColorSwatch = ({ 
  name, 
  token, 
  className 
}: { 
  name: string; 
  token: string; 
  className: string;
}) => (
  <div className="flex flex-col items-center gap-2">
    <div className={`w-16 h-16 rounded-lg border border-border shadow-sm ${className}`} />
    <Text size="sm" weight="medium" className="text-center">{name}</Text>
    <Text size="xs" variant="muted" className="text-center font-mono">{token}</Text>
  </div>
);

const DesignSystem = () => {
  return (
    <div className="min-h-screen bg-background">
      <MenuBar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <Heading level="h1" className="font-display">Design System</Heading>
            <Text size="lg" variant="muted" className="max-w-2xl mx-auto">
              A comprehensive guide to the color tokens, typography, and component variants used throughout the application.
            </Text>
          </div>

          <Separator />

          {/* Brand Colors */}
          <section className="space-y-6">
            <Heading level="h2">Brand Colors</Heading>
            <Text variant="muted">Primary brand colors used for key actions and branding elements.</Text>
            
            <div className="flex flex-wrap gap-6">
              <ColorSwatch 
                name="Brand Primary" 
                token="bg-brand-primary" 
                className="bg-brand-primary" 
              />
              <ColorSwatch 
                name="Brand Secondary" 
                token="bg-brand-secondary" 
                className="bg-brand-secondary" 
              />
            </div>
          </section>

          <Separator />

          {/* Score Colors */}
          <section className="space-y-6">
            <Heading level="h2">Score Colors</Heading>
            <Text variant="muted">Semantic colors for rating and score indicators.</Text>
            
            <div className="flex flex-wrap gap-6">
              <ColorSwatch 
                name="Excellent" 
                token="bg-score-excellent" 
                className="bg-score-excellent" 
              />
              <ColorSwatch 
                name="Good" 
                token="bg-score-good" 
                className="bg-score-good" 
              />
              <ColorSwatch 
                name="Fair" 
                token="bg-score-fair" 
                className="bg-score-fair" 
              />
              <ColorSwatch 
                name="Poor" 
                token="bg-score-poor" 
                className="bg-score-poor" 
              />
            </div>
          </section>

          <Separator />

          {/* Status Colors */}
          <section className="space-y-6">
            <Heading level="h2">Status Colors</Heading>
            <Text variant="muted">Colors for success, warning, error, and info states.</Text>
            
            <div className="flex flex-wrap gap-6">
              <ColorSwatch 
                name="Success" 
                token="bg-success" 
                className="bg-success" 
              />
              <ColorSwatch 
                name="Warning" 
                token="bg-warning" 
                className="bg-warning" 
              />
              <ColorSwatch 
                name="Error" 
                token="bg-error" 
                className="bg-error" 
              />
              <ColorSwatch 
                name="Info" 
                token="bg-info" 
                className="bg-info" 
              />
            </div>
          </section>

          <Separator />

          {/* Surface Colors */}
          <section className="space-y-6">
            <Heading level="h2">Surface Colors</Heading>
            <Text variant="muted">Background and surface colors for UI elements.</Text>
            
            <div className="flex flex-wrap gap-6">
              <ColorSwatch 
                name="Background" 
                token="bg-background" 
                className="bg-background" 
              />
              <ColorSwatch 
                name="Foreground" 
                token="bg-foreground" 
                className="bg-foreground" 
              />
              <ColorSwatch 
                name="Card" 
                token="bg-card" 
                className="bg-card" 
              />
              <ColorSwatch 
                name="Muted" 
                token="bg-muted" 
                className="bg-muted" 
              />
              <ColorSwatch 
                name="Accent" 
                token="bg-accent" 
                className="bg-accent" 
              />
              <ColorSwatch 
                name="Surface Warm" 
                token="bg-surface-warm" 
                className="bg-surface-warm" 
              />
              <ColorSwatch 
                name="Surface Cream" 
                token="bg-surface-cream" 
                className="bg-surface-cream" 
              />
            </div>
          </section>

          <Separator />

          {/* Heatmap Colors */}
          <section className="space-y-6">
            <Heading level="h2">Heatmap Colors</Heading>
            <Text variant="muted">Colors used for map visualizations and data density.</Text>
            
            <div className="flex flex-wrap gap-6">
              <ColorSwatch 
                name="Very High" 
                token="bg-heatmap-very-high" 
                className="bg-heatmap-very-high" 
              />
              <ColorSwatch 
                name="High" 
                token="bg-heatmap-high" 
                className="bg-heatmap-high" 
              />
              <ColorSwatch 
                name="Medium High" 
                token="bg-heatmap-medium-high" 
                className="bg-heatmap-medium-high" 
              />
              <ColorSwatch 
                name="Medium" 
                token="bg-heatmap-medium" 
                className="bg-heatmap-medium" 
              />
              <ColorSwatch 
                name="Low Medium" 
                token="bg-heatmap-low-medium" 
                className="bg-heatmap-low-medium" 
              />
              <ColorSwatch 
                name="Low" 
                token="bg-heatmap-low" 
                className="bg-heatmap-low" 
              />
              <ColorSwatch 
                name="None" 
                token="bg-heatmap-none" 
                className="bg-heatmap-none" 
              />
            </div>
          </section>

          <Separator />

          {/* Typography */}
          <section className="space-y-6">
            <Heading level="h2">Typography</Heading>
            <Text variant="muted">Heading and body text styles using the typography component.</Text>
            
            <Card>
              <CardHeader>
                <CardTitle>Headings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Heading level="h1">Heading 1</Heading>
                  <Text size="xs" variant="muted" className="font-mono">{'<Heading level="h1">'}</Text>
                </div>
                <div className="space-y-1">
                  <Heading level="h2">Heading 2</Heading>
                  <Text size="xs" variant="muted" className="font-mono">{'<Heading level="h2">'}</Text>
                </div>
                <div className="space-y-1">
                  <Heading level="h3">Heading 3</Heading>
                  <Text size="xs" variant="muted" className="font-mono">{'<Heading level="h3">'}</Text>
                </div>
                <div className="space-y-1">
                  <Heading level="h4">Heading 4</Heading>
                  <Text size="xs" variant="muted" className="font-mono">{'<Heading level="h4">'}</Text>
                </div>
                <div className="space-y-1">
                  <Heading level="h5">Heading 5</Heading>
                  <Text size="xs" variant="muted" className="font-mono">{'<Heading level="h5">'}</Text>
                </div>
                <div className="space-y-1">
                  <Heading level="h6">Heading 6</Heading>
                  <Text size="xs" variant="muted" className="font-mono">{'<Heading level="h6">'}</Text>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Body Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Text size="lg">Large body text for emphasis</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'<Text size="lg">'}</Text>
                </div>
                <div className="space-y-1">
                  <Text>Default body text for regular content</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'<Text>'}</Text>
                </div>
                <div className="space-y-1">
                  <Text size="sm">Small text for secondary information</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'<Text size="sm">'}</Text>
                </div>
                <div className="space-y-1">
                  <Text size="xs">Extra small text for captions</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'<Text size="xs">'}</Text>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Text Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Text variant="default">Default variant</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'variant="default"'}</Text>
                </div>
                <div className="space-y-1">
                  <Text variant="muted">Muted variant for secondary text</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'variant="muted"'}</Text>
                </div>
                <div className="space-y-1">
                  <Text variant="primary">Primary variant for emphasis</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'variant="primary"'}</Text>
                </div>
                <div className="space-y-1">
                  <Text variant="success">Success variant</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'variant="success"'}</Text>
                </div>
                <div className="space-y-1">
                  <Text variant="warning">Warning variant</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'variant="warning"'}</Text>
                </div>
                <div className="space-y-1">
                  <Text variant="error">Error variant</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'variant="error"'}</Text>
                </div>
                <div className="space-y-1">
                  <Text variant="info">Info variant</Text>
                  <Text size="xs" variant="muted" className="font-mono">{'variant="info"'}</Text>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Button Variants */}
          <section className="space-y-6">
            <Heading level="h2">Button Variants</Heading>
            <Text variant="muted">Available button styles and sizes.</Text>
            
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sizes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🔍</Button>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Badge Variants */}
          <section className="space-y-6">
            <Heading level="h2">Badge Variants</Heading>
            <Text variant="muted">Available badge styles for labels and status indicators.</Text>
            
            <Card>
              <CardContent className="pt-6 flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Badge className="bg-score-excellent text-white">Excellent (9-10)</Badge>
                <Badge className="bg-score-good text-white">Good (7-8)</Badge>
                <Badge className="bg-score-fair text-white">Fair (5-6)</Badge>
                <Badge className="bg-score-poor text-white">Poor (1-4)</Badge>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* Usage Examples */}
          <section className="space-y-6">
            <Heading level="h2">Usage Examples</Heading>
            <Text variant="muted">Common patterns and combinations.</Text>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status Card</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <Text variant="success" weight="medium">Success message</Text>
                    <Text size="sm" variant="muted">Operation completed successfully.</Text>
                  </div>
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <Text variant="warning" weight="medium">Warning message</Text>
                    <Text size="sm" variant="muted">Please review before continuing.</Text>
                  </div>
                  <div className="p-4 rounded-lg bg-error/10 border border-error/20">
                    <Text variant="error" weight="medium">Error message</Text>
                    <Text size="sm" variant="muted">Something went wrong.</Text>
                  </div>
                  <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                    <Text variant="info" weight="medium">Info message</Text>
                    <Text size="sm" variant="muted">Here's some helpful information.</Text>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Brand Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                    <Text className="text-brand-primary" weight="medium">Primary Brand</Text>
                    <Text size="sm" variant="muted">Used for primary actions and highlights.</Text>
                  </div>
                  <div className="p-4 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20">
                    <Text className="text-brand-secondary" weight="medium">Secondary Brand</Text>
                    <Text size="sm" variant="muted">Used for secondary actions and accents.</Text>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button className="bg-brand-primary hover:bg-brand-primary/90">Primary Action</Button>
                    <Button className="bg-brand-secondary hover:bg-brand-secondary/90">Secondary Action</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DesignSystem;
