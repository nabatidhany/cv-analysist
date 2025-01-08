"use client";

import { useState } from "react";
import { Upload, FileText, Search, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useResultStore } from "@/store/resultStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const router = useRouter(); 
  const setResult = useResultStore((state) => state.setResult);

  const uploadToSupabase = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('cvscoring')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('cvscoring')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      toast({
        title: "Missing information",
        description: "Please upload a CV and enter a job description",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const fileUrl = await uploadToSupabase(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Send to analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl,
          jobDescription,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      // Simpan hasil analisis di Zustand
      setResult(result);

      // Navigasi ke halaman /result
      router.push('/result');
      
      // toast({
      //   title: "Analysis Complete",
      //   description: `Match rate: ${result.match_percentage}%`,
      // });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <Dialog open={isAnalyzing}>
        <DialogContent onInteractOutside={(e) => {
          e.preventDefault();
        }} style={{borderRadius: 20}} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isAnalyzing && (
                <div className="space-y-2">
                  <p className="text-sm text-center text-gray-600">
                    {uploadProgress < 100 ? "Uploading..." : "Analyzing..."}
                  </p>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              <div className="w-full h-60 flex justify-center items-center">
                {/* COntent iklan goes here */}
                <img className="h-52" src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm9ycGp6NG00c3p1MzRlYXFvaGJ6N25nMXl3c3h2eDVodGdmbWNzZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9DPldJHzZKtOnEn6/giphy.webp" alt="load" />
              </div>
              "Just a moment, we're getting everything ready for you. It shouldn't take long."
            </DialogDescription>
            <Progress value={uploadProgress} className="h-2" />
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              CV Analyzer
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Get instant insights on how well your CV matches the job requirements
          </p>
        </div>

        <div className='w-full text-center flex flex-col justify-center gap-2 items-center'>
          <p className="text-sm text-gray-500">Jika ini membantu kamu, dan kamu ingin traktir aku, silahkan klik dibawah ini ya.</p>
          <a href="https://trakteer.id/dhany_nabati/tip" target="_blank"><img id="wse-buttons-preview" src="https://edge-cdn.trakteer.id/images/embed/trbtn-red-1.png?date=18-11-2023" height="40" style={{border:"0px;height:40px;"}} alt="Trakteer Saya" /></a>
        </div>

        <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-sm border-t border-l border-white/20">
          <div className="space-y-6">
            <div>
              <Label htmlFor="cv-upload" className="text-xl font-medium text-gray-800">
                Upload Your CV
              </Label>
              <div className="mt-3">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="cv-upload"
                    className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-xl cursor-pointer bg-gradient-to-b from-white to-gray-50 hover:bg-gradient-to-b hover:from-gray-50 hover:to-gray-100 transition-all duration-300 border-indigo-200 hover:border-indigo-300"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {file ? (
                        <>
                          <FileText className="w-16 h-16 text-indigo-500 mb-4" />
                          <p className="text-lg font-medium text-gray-700">{file.name}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Click to change file
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-16 h-16 text-indigo-400 mb-4" />
                          <p className="mb-2 text-lg text-gray-700">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-sm text-gray-500">
                            PDF, DOC, or DOCX (MAX. 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    <Input
                      id="cv-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="job-description" className="text-xl font-medium text-gray-800">
                Job Description
              </Label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here..."
                className="mt-3 h-48 resize-none bg-white/80 backdrop-blur-sm text-gray-700"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-gray-600">
                    {uploadProgress < 100 ? "Uploading..." : "Analyzing..."}
                  </p>
                </div>
              )}

              <Button
                className="w-full h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !file || !jobDescription}
              >
                {isAnalyzing ? (
                  "Processing..."
                ) : (
                  <>
                    <Search className="mr-2 h-6 w-6" />
                    Analyze CV
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}