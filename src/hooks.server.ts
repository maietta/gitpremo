import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers,
	});

	event.locals.session = (session?.session ?? null) as App.Locals['session'];
	event.locals.user = (session?.user ?? null) as App.Locals['user'];

	if (event.url.pathname.startsWith("/api/auth")) {
		// @ts-expect-error Better Auth types mismatch
		return svelteKitHandler({ event, resolve, auth });
	}

	return resolve(event);
};
