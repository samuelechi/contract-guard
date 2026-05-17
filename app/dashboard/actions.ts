'use server';

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { analyzeContract } from "@/app/ai/analyze";
import { extractText } from "unpdf";

export async function UploadContract(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) throw new Error("User not authenticated");

    const dbUser = await prisma.user.upsert({
        where: { email: user.email as string },
        update: {},
        create: {
            id: user.id,
            email: user.email as string,
        }
    });

    // Extract text using unpdf (works on Vercel serverless)
    console.log("📄 Extracting text from PDF...");
    let contractText = "";
    try {
        const arrayBuffer = await file.arrayBuffer();
        const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
        contractText = text;
        console.log("✅ Text extracted successfully. Length:", contractText.length);
    } catch (e) {
        console.error("⚠️ Text extraction failed (still uploading file):", e);
    }

    // Upload file to Supabase Storage
    const fileName = `${dbUser.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
        .from("contracts")
        .upload(fileName, file);

    if (uploadError) {
        console.error("File upload error:", uploadError);
        throw new Error("File upload to storage failed");
    }

    const { data: { publicUrl } } = supabase.storage
        .from("contracts")
        .getPublicUrl(fileName);

    const contract = await prisma.contract.create({
        data: {
            userId: dbUser.id,
            name: file.name.replace(".pdf", ""),
            fileUrl: publicUrl,
            status: "ANALYZING",
            riskScore: 0,
        }
    });

    // Trigger AI analysis in background
    if (contractText) {
        analyzeContract(contract.id, contractText).catch(err =>
            console.error("Background Analysis Error:", err)
        );
    }

    revalidatePath("/dashboard");
    return { success: true, contractId: contract.id };
}

export async function deleteContract(id: string) {
    try {
        await prisma.contract.delete({ where: { id } });
        revalidatePath("/dashboard/contracts");
        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false };
    }
}