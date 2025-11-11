import ImageUploader from "@/components/ImageUploader";
import { Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Perfect Smile AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your smile with AI-powered teeth whitening and alignment. 
            Get a perfect, natural-looking smile in seconds.
          </p>
        </div>

        {/* Main Content */}
        <ImageUploader />

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Advanced Gemini AI analyzes and perfects your smile naturally
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg">Instant Results</h3>
            <p className="text-sm text-muted-foreground">
              See your transformed smile in seconds, not weeks
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg">Natural Look</h3>
            <p className="text-sm text-muted-foreground">
              Perfectly white and symmetrical while looking completely natural
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
