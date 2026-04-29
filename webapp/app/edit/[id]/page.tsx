"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import type { CheatSheet } from "@/lib/types";
import Editor from "@/components/Editor";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cs, setCs] = useState<CheatSheet | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const raw = localStorage.getItem(`cs-${id}`);
    if (!raw) {
      setError("Cheat sheet not found. It may have been created in a different session.");
      return;
    }
    try {
      setCs(JSON.parse(raw));
    } catch {
      setError("Failed to load cheat sheet data.");
    }
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 max-w-md text-center"
        >
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (!cs) {
    return (
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <Loader2 size={32} className="text-violet-400 animate-spin" />
      </div>
    );
  }

  return <Editor initial={cs} />;
}
