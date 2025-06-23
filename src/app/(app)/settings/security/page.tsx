import { ActiveSessions } from './_components/active-sessions';
import { ChangePassword } from './_components/change-password';
import { ConnectedAccounts } from './_components/connected-accounts';

export default function Page() {
	return (
		<>
			<ConnectedAccounts />
			<ChangePassword />
			<ActiveSessions />
		</>
	);
}
