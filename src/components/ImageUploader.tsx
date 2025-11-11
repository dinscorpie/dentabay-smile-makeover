import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Sparkles, Download, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ImageUploader = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setTransformedImage(null); // Reset transformed image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!originalImage) return;

    setIsTransforming(true);
    try {
      const { data, error } = await supabase.functions.invoke('transform-teeth', {
        body: { imageData: originalImage }
      });

      if (error) {
        // Handle rate limiting specially
        if (error.message?.includes('FunctionsHttpError: 429')) {
          const retryDelay = data?.retryDelay || '60s';
          toast.error(`Rate limited by AI service. Please retry in about ${retryDelay}.`);
          throw error;
        }
        throw error;
      }

      if (data?.success && data?.imageData) {
        setTransformedImage(data.imageData);
        toast.success('Teeth transformed successfully!');
      } else {
        const errorMsg = data?.error || 'Transformation failed';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Transform error:', error);
      // Only show generic error if we haven't already shown a specific one
      if (!error?.message?.includes('FunctionsHttpError: 429') && !error?.message?.includes('Rate limited')) {
        toast.error(error?.message || 'Failed to transform image. Please try again.');
      }
    } finally {
      setIsTransforming(false);
    }
  };

  const handleDownload = () => {
    if (!transformedImage) return;

    const link = document.createElement('a');
    link.href = transformedImage;
    link.download = 'transformed-smile.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Upload Section */}
      {!originalImage ? (
        <Card className="p-12 border-2 border-dashed border-border hover:border-primary transition-colors">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-6 bg-primary/10 rounded-full">
              <Upload className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">Upload Your Smile</h3>
              <p className="text-muted-foreground max-w-md">
                Upload a photo showing your smile. Our AI will transform your teeth to be perfectly white and symmetrical.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              <Upload className="w-5 h-5 mr-2" />
              Choose Image
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Original Image */}
          <Card className="overflow-hidden">
            <div className="p-4 bg-muted border-b">
              <h3 className="font-semibold text-center">Original</h3>
            </div>
            <div className="aspect-square bg-muted/30 flex items-center justify-center p-4">
              <img
                src={originalImage}
                alt="Original"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </Card>

          {/* Transformed Image */}
          <Card className="overflow-hidden">
            <div className="p-4 bg-primary/10 border-b">
              <h3 className="font-semibold text-center flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Transformed
              </h3>
            </div>
            <div className="aspect-square bg-muted/30 flex items-center justify-center p-4">
              {transformedImage ? (
                <img
                  src={transformedImage}
                  alt="Transformed"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Your transformed smile will appear here</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      {originalImage && (
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setOriginalImage(null);
              setTransformedImage(null);
            }}
          >
            Upload New Image
          </Button>

          <Button
            size="lg"
            onClick={handleTransform}
            disabled={isTransforming}
            className="min-w-48"
          >
            {isTransforming ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Transforming...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Transform Teeth
              </>
            )}
          </Button>

          {transformedImage && (
            <>
              <Button
                variant="outline"
                onClick={handleTransform}
                disabled={isTransforming}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Regenerate
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleDownload}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Result
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
