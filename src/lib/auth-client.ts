import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { auth } from './auth';
import { ac, roles } from './permissions';

// Create a client for the auth server
const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL,
	plugins: [inferAdditionalFields<typeof auth>(), adminClient({ ac, roles })],
});

// Export the signIn function from the auth client, much easier to read
export const {
	signIn,
	signUp,
	signOut,
	useSession,
	admin,
	updateUser,
	listAccounts,
	listSessions,
	linkSocial,
	unlinkAccount,
	changePassword,
	revokeSession,
	revokeSessions,
	forgetPassword,
	resetPassword,
} = authClient;
