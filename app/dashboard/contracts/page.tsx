import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import ContractTable from "./contract-table";

/*export default function ContractsIndex() {
    // If someone lands here, send them back to the dashboard
    redirect("/dashboard");
}*/

export default async function AllContractsPage() {

    //Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        redirect('/login');
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
    });

    if (!dbUser) {
        redirect('/dashboard');
    }

    const contracts = await prisma.contract.findMany({
        where: {
            userId: dbUser.id
        },
    })

    return (
        <div className="p-8 ">
            <ContractTable contracts={contracts as any} />
        </div>
    )
}