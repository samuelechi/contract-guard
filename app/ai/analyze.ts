"use server"

import OpenAi from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY, // Changed to ALL CAPS
});

export async function analyzeContract(contractId: string, contractText: string) {
    console.log("🤖 AI Analysis Started for:", contractId);

    if (!contractId || !contractText) {
        console.error("❌ Missing contract ID or text for analysis.");
        return { success: false, error: "Missing data" };
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert legal contract analyst. Your role is to review the provided contract text and analyze it for risks, unfair terms, and key dates.

          You must return your analysis as a valid JSON object with exactly these three fields:
          1. "riskScore" (Integer, 0-100): 0 is safe, 100 is extremely risky.
          2. "summary" (String): A concise executive summary (max 3 sentences).
          3. "expirationDate" (String | null): The expiration date in "YYYY-MM-DD" format. If perpetual or undefined, return null.
          
          Output ONLY the JSON object.`
                },
                {
                    role: "user",
                    content: `Here is the contract text (truncated):\n\n${contractText.substring(0, 15000)}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0].message.content;
        if (!rawContent) {
            throw new Error("Empty response from AI");
        }
        const aiResponse = JSON.parse(rawContent);
        console.log("✅ AI Analysis Complete:", aiResponse);

        // update database
        await prisma.contract.update({
            where: { id: contractId },
            data: {
                status: "COMPLETED",
                riskScore: aiResponse.riskScore || 0,
                aiSummary: aiResponse.summary || "Analysis failed.",
                expirationDate: aiResponse.expirationDate ? new Date(aiResponse.expirationDate) : null,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("❌ AI Analysis Error:", error);
        await prisma.contract.update({
            where: { id: contractId },
            data: { status: "FAILED" }
        });
        return { success: false, error: "AI Analysis Error" };
    }
}