import { Metadata } from "next";
import { UploadForm } from "@/components/upload/UploadForm";

export const metadata: Metadata = { title: "Upload" };

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Upload a track</h1>
      <UploadForm />
    </div>
  );
}
