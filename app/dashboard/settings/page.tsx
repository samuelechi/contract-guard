import { getNotificationPrefs } from './actions';
import SettingsClient from './settings-client';
// Import your auth function here, e.g., import { getUser } from '@/lib/auth';

export default async function SettingsPage() {
    const notifPrefs = await getNotificationPrefs();

    // Fetch the current user data (replace this with your actual auth logic)
    // const user = await getUser(); 

    return (
        <SettingsClient
            initialNotifPrefs={notifPrefs}
            // Add the missing props here using your fetched user data:
            initialDisplayName={"User Name"} // e.g., user.name
            initialAvatarUrl={null}          // e.g., user.image
            userEmail={"user@email.com"}     // e.g., user.email
        />
    );
}