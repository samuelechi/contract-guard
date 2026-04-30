import { getNotificationPrefs } from './actions';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
    const notifPrefs = await getNotificationPrefs();
    return <SettingsClient initialNotifPrefs={notifPrefs} />;
}