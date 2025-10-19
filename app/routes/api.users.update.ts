import {  ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { json } from "~/lib/response";
import { getUserFromRequest } from "~/lib/user";
import prisma from "~/prisma.server";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const body = Object.fromEntries(formData) as Record<string, string>;
    const { user } = await getUserFromRequest(request);
    if (!user) {
        return redirect('/login?error=not_authenticated');
    }
    await prisma.user.update({
        where: { id: user.id },
        data: {
            first_name: body.first_name || user.first_name,
            last_name: body.last_name || user.last_name,
        },
    })
    .then(updatedUser => { return { ...user, ...updatedUser }; })
    .catch(() => { return user; });

    return redirect('/dashboard');
}