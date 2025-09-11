// Server-side Firebase Admin initialization
// npm install firebase-admin

import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!admin.apps.length) {
	if (!projectId || !clientEmail || !privateKey) {
		console.warn('Firebase Admin not fully configured. Some features may not work.');
	} else {
		admin.initializeApp({
			credential: admin.credential.cert({
				projectId,
				clientEmail,
				privateKey,
			}),
		});
	}
}

export const firebaseAdmin = admin;
export async function verifyIdToken(idToken) {
	if (!admin.apps.length) throw new Error('Firebase Admin not initialized');
	return admin.auth().verifyIdToken(idToken);
}


