// Firebase Configuration and Initialization

// Firebase configuration object
const firebaseConfig = {
    // These would be replaced with actual Firebase project credentials
    apiKey: "your-api-key-here",
    authDomain: "mh-construction.firebaseapp.com",
    projectId: "mh-construction",
    storageBucket: "mh-construction.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id-here",
    measurementId: "your-measurement-id-here"
};

class FirebaseManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.storage = null;
        this.analytics = null;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                console.warn('Firebase SDK not loaded. Using offline mode.');
                this.setupOfflineMode();
                return;
            }

            // Initialize Firebase
            this.app = firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.storage = firebase.storage();
            
            // Initialize Analytics if available
            if (firebase.analytics) {
                this.analytics = firebase.analytics();
            }

            this.initialized = true;
            console.log('Firebase initialized successfully');

            // Setup offline persistence
            await this.setupOfflinePersistence();
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.setupOfflineMode();
        }
    }

    async setupOfflinePersistence() {
        try {
            await this.db.enablePersistence({ synchronizeTabs: true });
            console.log('Offline persistence enabled');
        } catch (error) {
            if (error.code === 'failed-precondition') {
                console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (error.code === 'unimplemented') {
                console.warn('The current browser does not support offline persistence');
            }
        }
    }

    setupOfflineMode() {
        // Fallback for when Firebase is not available
        this.initialized = false;
        console.log('Running in offline mode - data will be stored locally');
        
        // Use localStorage for basic functionality
        this.localStore = {
            estimates: JSON.parse(localStorage.getItem('mh_estimates') || '[]'),
            contacts: JSON.parse(localStorage.getItem('mh_contacts') || '[]'),
            chats: JSON.parse(localStorage.getItem('mh_chats') || '[]')
        };
    }

    // Firestore Operations
    async saveEstimate(estimateData) {
        if (this.initialized) {
            try {
                const docRef = await this.db.collection('estimates').add({
                    ...estimateData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    source: 'website',
                    status: 'new'
                });
                console.log('Estimate saved to Firestore:', docRef.id);
                return { success: true, id: docRef.id };
            } catch (error) {
                console.error('Error saving estimate:', error);
                return this.saveEstimateOffline(estimateData);
            }
        } else {
            return this.saveEstimateOffline(estimateData);
        }
    }

    saveEstimateOffline(estimateData) {
        const estimate = {
            ...estimateData,
            id: 'offline_' + Date.now(),
            createdAt: new Date().toISOString(),
            synced: false
        };
        
        this.localStore.estimates.push(estimate);
        localStorage.setItem('mh_estimates', JSON.stringify(this.localStore.estimates));
        
        console.log('Estimate saved offline:', estimate.id);
        return { success: true, id: estimate.id };
    }

    async saveContact(contactData) {
        if (this.initialized) {
            try {
                const docRef = await this.db.collection('contacts').add({
                    ...contactData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    source: 'website',
                    status: 'new'
                });
                console.log('Contact saved to Firestore:', docRef.id);
                return { success: true, id: docRef.id };
            } catch (error) {
                console.error('Error saving contact:', error);
                return this.saveContactOffline(contactData);
            }
        } else {
            return this.saveContactOffline(contactData);
        }
    }

    saveContactOffline(contactData) {
        const contact = {
            ...contactData,
            id: 'offline_' + Date.now(),
            createdAt: new Date().toISOString(),
            synced: false
        };
        
        this.localStore.contacts.push(contact);
        localStorage.setItem('mh_contacts', JSON.stringify(this.localStore.contacts));
        
        console.log('Contact saved offline:', contact.id);
        return { success: true, id: contact.id };
    }

    async saveChatConversation(chatData) {
        if (this.initialized) {
            try {
                const docRef = await this.db.collection('chats').add({
                    ...chatData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { success: true, id: docRef.id };
            } catch (error) {
                console.error('Error saving chat:', error);
                return this.saveChatOffline(chatData);
            }
        } else {
            return this.saveChatOffline(chatData);
        }
    }

    saveChatOffline(chatData) {
        const chat = {
            ...chatData,
            id: 'offline_' + Date.now(),
            createdAt: new Date().toISOString(),
            synced: false
        };
        
        this.localStore.chats.push(chat);
        localStorage.setItem('mh_chats', JSON.stringify(this.localStore.chats));
        
        return { success: true, id: chat.id };
    }

    // Analytics
    trackEvent(eventName, parameters = {}) {
        if (this.analytics) {
            this.analytics.logEvent(eventName, parameters);
        }
        
        // Also send to Google Analytics if available
        if (window.gtag) {
            gtag('event', eventName, parameters);
        }
        
        console.log('Event tracked:', eventName, parameters);
    }

    trackPageView(pageName) {
        if (this.analytics) {
            this.analytics.logEvent('page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
        
        if (window.gtag) {
            gtag('config', firebaseConfig.measurementId, {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }

    // Utility methods
    isOnline() {
        return navigator.onLine && this.initialized;
    }

    async syncOfflineData() {
        if (!this.initialized || !navigator.onLine) {
            return false;
        }

        try {
            // Sync estimates
            const unsyncedEstimates = this.localStore.estimates.filter(est => !est.synced);
            for (const estimate of unsyncedEstimates) {
                await this.saveEstimate(estimate);
                estimate.synced = true;
            }

            // Sync contacts
            const unsyncedContacts = this.localStore.contacts.filter(contact => !contact.synced);
            for (const contact of unsyncedContacts) {
                await this.saveContact(contact);
                contact.synced = true;
            }

            // Update local storage
            localStorage.setItem('mh_estimates', JSON.stringify(this.localStore.estimates));
            localStorage.setItem('mh_contacts', JSON.stringify(this.localStore.contacts));

            console.log('Offline data synced successfully');
            return true;
        } catch (error) {
            console.error('Error syncing offline data:', error);
            return false;
        }
    }

    // Connection monitoring
    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            console.log('Connection restored');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost - switching to offline mode');
        });
    }
}

// Initialize Firebase Manager
let firebaseManager;

document.addEventListener('DOMContentLoaded', () => {
    firebaseManager = new FirebaseManager();
    
    // Set up connection monitoring
    firebaseManager.setupConnectionMonitoring();
    
    // Track initial page view
    setTimeout(() => {
        firebaseManager.trackPageView();
    }, 1000);
});

// Global access
window.firebaseManager = firebaseManager;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseManager;
}
