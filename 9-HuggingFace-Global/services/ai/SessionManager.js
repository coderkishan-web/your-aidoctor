/**
 * Session Manager for AI Medical Companion
 * Handles retrieval and persistence of user session state and memory in database
 * with fallback support for guest sessions.
 */

import userModel from '../../models/userModel.js';
import { createInitialMemory } from './MemoryEngine.js';

function getGuestSession(id = 'guest_123') {
    return {
        user: { _id: id, name: 'Guest Patient', phone: 'Emergency Services (108/112)' },
        healthProfile: { structuredMemory: createInitialMemory() },
        structuredMemory: createInitialMemory(),
        chatHistory: []
    };
}

export async function loadUserSession(userId) {
    if (!userId) return getGuestSession();
    try {
        const user = await userModel.findById(userId).select('-password');
        if (!user) return getGuestSession(userId);

        const healthProfile = user.healthProfile || {};
        const structuredMemory = healthProfile.structuredMemory || createInitialMemory();

        return {
            user,
            healthProfile,
            structuredMemory,
            chatHistory: user.aiChatHistory || []
        };
    } catch (err) {
        return getGuestSession(userId);
    }
}

export async function saveUserSession(userId, updatedHealthProfile, updatedChatHistory) {
    if (!userId || String(userId).startsWith('guest_')) return true;
    try {
        await userModel.findByIdAndUpdate(userId, {
            healthProfile: updatedHealthProfile,
            aiChatHistory: updatedChatHistory
        });
        return true;
    } catch (err) {
        return false;
    }
}
