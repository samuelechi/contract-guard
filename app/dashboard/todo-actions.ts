"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleTodo(id: string, isDone: boolean) {
    await prisma.todo.update({
        where: { id },
        data: { isDone }
    });
    revalidatePath("/dashboard");
}

export async function addTodo(userId: string, task: string) {
    await prisma.todo.create({
        data: { userId, task }
    });
    revalidatePath("/dashboard");
}

export async function deleteTodo(id: string) {
    await prisma.todo.delete({
        where: { id }
    });
    revalidatePath("/dashboard");
}