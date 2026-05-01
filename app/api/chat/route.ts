import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new Response('Unauthorized', { status: 401 });

        const { messages, contractId } = await req.json();

        // Build system prompt
        let systemPrompt = `You are ContractGuard AI, an expert legal assistant specializing in contract analysis, risk assessment, and legal document review. You help users understand their contracts, identify risks, and make informed decisions.

Key traits:
- Professional but approachable tone
- Always clarify you are an AI and not a licensed attorney
- Flag high-risk clauses clearly
- Be concise and structured in your responses
- Use bullet points and headers for clarity when appropriate
- When asked about specific clauses, explain them in plain English`;

        // If a contract is selected, inject its context
        if (contractId) {
            const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
            if (dbUser) {
                const contract = await prisma.contract.findFirst({
                    where: { id: contractId, userId: dbUser.id }
                });
                if (contract) {
                    systemPrompt += `\n\n---\nCURRENT CONTRACT CONTEXT:\nName: ${contract.name}\nRisk Score: ${contract.riskScore}/100\nStatus: ${contract.status}\n${contract.aiSummary ? `\nAI Summary:\n${contract.aiSummary}` : ''}\n\nThe user is asking questions about this specific contract. Use this context to give accurate, relevant answers.`;
                }
            }
        }

        // Stream response from OpenAI
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            stream: true,
            max_tokens: 1024,
            temperature: 0.7,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
            ],
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content || '';
                    if (text) controller.enqueue(encoder.encode(text));
                }
                controller.close();
            },
        });

        return new Response(readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}