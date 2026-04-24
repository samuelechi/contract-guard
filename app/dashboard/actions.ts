'use server';

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { extractTextFromPdf } from "@/lib/pdf-loader"; // ✅ 1. Import PDF Loader
import { analyzeContract } from "@/app/ai/analyze";    // ✅ 2. Import AI Action

export async function UploadContract(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file provided");
    }

    // 1. Auth Check (Supabase)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        throw new Error("User not authenticated");
    }

    // 2. Database User Check
    const dbUser = await prisma.user.upsert({
        where: { email: user.email as string },
        update: {},
        create: {
            id: user.id,            // Matches Supabase ID
            email: user.email as string,
        }
    });

    // ✅ 3. EXTRACT TEXT FROM PDF (The "Eyes")
    // We convert the file to a buffer so our parser can read it.
    console.log("📄 Extracting text from PDF...");
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let contractText = "";
    try {
        contractText = await extractTextFromPdf(fileBuffer);
        console.log("✅ Text extracted successfully. Length:", contractText.length);
    } catch (e) {
        console.error("⚠️ Text extraction failed (still uploading file):", e);
    }

    // 4. Upload file to Supabase Storage
    const fileName = `${dbUser.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase
        .storage
        .from("contracts")
        .upload(fileName, file);

    if (uploadError) {
        console.error("File upload error:", uploadError);
        throw new Error("File upload to storage failed");
    }

    // 5. Get Public URL
    const { data: { publicUrl } } = supabase
        .storage
        .from("contracts")
        .getPublicUrl(fileName);

    // 6. Save Record to Database
    const contract = await prisma.contract.create({
        data: {
            userId: dbUser.id,
            name: file.name.replace(".pdf", ""),
            fileUrl: publicUrl,
            status: "ANALYZING", // ✅ Set status to "ANALYZING" (Yellow Badge)
            riskScore: 0,
        }
    });

    // ✅ 7. TRIGGER AI ANALYSIS (The "Brain")
    // We do NOT "await" this. We let it run in the background.
    if (contractText) {
        analyzeContract(contract.id, contractText).catch(err =>
            console.error("Background Analysis Error:", err)
        );
    }

    revalidatePath("/dashboard");
    return { success: true, contractId: contract.id };
}

// (Keep your deleteContract function below exactly as it was)
export async function deleteContract(id: string) {
    try {
        await prisma.contract.delete({
            where: { id },
        });

        // This clears the cache so the table updates
        revalidatePath("/dashboard/contracts");
        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false };
    }
}