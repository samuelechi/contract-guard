'use client';

import { UploadContract } from "../actions";
import { Button } from "@/components/ui/button";
import { FileText, X, Loader2, Sparkles, FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef } from "react";

export default function UploadZone() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);

    const handleBoxClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") setFile(droppedFile);
            else alert("Please upload a valid PDF file.");
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleUpload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!file) return;
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("file", file);
            const result = await UploadContract(formData);
            if (result.success && result.contractId) {
                router.push(`/dashboard/contracts/${result.contractId}`);
            } else {
                alert("Upload failed. Please try again.");
            }
        } catch (err: any) {
            console.error("File upload failed", err);
            alert(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-5">
            <div
                onClick={handleBoxClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative overflow-hidden border-2 border-dashed rounded-2xl p-10 cursor-pointer
                    transition-all duration-300 ease-out flex flex-col items-center justify-center
                    gap-4 text-center min-h-70 w-full group
                    ${isDragging
                        ? "border-blue-500 bg-blue-50/80 dark:bg-blue-500/5 scale-[1.02]"
                        : file
                            ? "border-emerald-400 dark:border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-500/5"
                            : "border-slate-300 dark:border-[#263652] hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-[#1a2235]"
                    }
                `}
            >
                {/* Subtle background glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-linear-to-b from-transparent to-slate-50/30 dark:to-blue-500/3" />

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                />

                {file ? (
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-sm mb-4 ring-4 ring-emerald-50 dark:ring-emerald-500/10">
                            <FileText className="h-10 w-10" />
                        </div>
                        <h3 className="text-base font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                            {file.name}
                        </h3>
                        <p className="text-sm text-emerald-600/80 dark:text-emerald-500 font-medium mb-6">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemove}
                            className="bg-transparent border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/50 transition-colors"
                        >
                            <X className="mr-1.5 h-4 w-4" />Remove File
                        </Button>
                    </div>
                ) : (
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`
                            h-20 w-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300
                            ${isDragging
                                ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 scale-110"
                                : "bg-slate-100 dark:bg-[#1a2235] text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                            }
                        `}>
                            <FileUp className="h-10 w-10" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                            {isDragging ? "Drop your contract here" : "Drag & drop your contract"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                            Upload your PDF agreement and our AI will instantly extract risks, summaries, and deadlines.
                        </p>
                        <div className="mt-6 flex items-center gap-4 w-full max-w-xs">
                            <div className="h-px bg-slate-200 dark:bg-[#263652] flex-1" />
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">or</span>
                            <div className="h-px bg-slate-200 dark:bg-[#263652] flex-1" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                            Browse files
                        </p>
                    </div>
                )}
            </div>

            {/* Upload Button */}
            {file && (
                <div className="flex justify-end">
                    <Button
                        onClick={handleUpload}
                        disabled={isLoading}
                        className="min-w-60 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                <span className="font-semibold">Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                <span className="font-semibold">Analyze Contract</span>
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}