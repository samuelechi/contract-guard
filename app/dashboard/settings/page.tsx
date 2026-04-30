import { getNotificationPrefs, getProfile } from './actions';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
    const [notifPrefs, profile] = await Promise.all([
        getNotificationPrefs(),
        getProfile(),
    ]);

    return (
        <SettingsClient
            initialNotifPrefs={notifPrefs}
            initialDisplayName={profile?.displayName ?? ''}
            initialAvatarUrl={profile?.avatarUrl ?? null}
            userEmail={profile?.email ?? ''}
        />
    );
}