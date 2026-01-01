
import { GoogleGenAI, Type } from "@google/genai";
import { 
    LOCAL_STORAGE_PREFIX, 
    USER_ID, 
    SYSTEM_ID, 
    AI_MODELS 
} from './constants';
import { 
    Notification, 
    AuditEventType, 
    AuditLogEntry, 
    UserProfile, 
    TokenType, 
    TokenTransaction,
    CareerGoal,
    JobApplication,
    AISuggestion,
    SkillAssessmentResult
} from './types';

// Utility: Generate Unique ID
export const generateId = () => `_${Math.random().toString(36).substr(2, 9)}`;

// --- LOCAL DATA STORE ---
export class LocalDataStore {
    private getKey(entityType: string, id?: string) {
        return `${LOCAL_STORAGE_PREFIX}${entityType}${id ? `_${id}` : ''}`;
    }

    public getItem<T>(entityType: string, id: string): T | null {
        const data = localStorage.getItem(this.getKey(entityType, id));
        return data ? JSON.parse(data) : null;
    }

    public getAllItems<T>(entityType: string): T[] {
        const items: T[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.getKey(entityType))) {
                const data = localStorage.getItem(key);
                if (data) items.push(JSON.parse(data));
            }
        }
        return items;
    }

    public setItem<T extends { id: string }>(entityType: string, item: T) {
        localStorage.setItem(this.getKey(entityType, item.id), JSON.stringify(item));
    }

    public removeItem(entityType: string, id: string) {
        localStorage.removeItem(this.getKey(entityType, id));
    }
}
export const dataStore = new LocalDataStore();

// --- NOTIFICATION SERVICE ---
export class NotificationService {
    private listeners: ((notifications: Notification[]) => void)[] = [];
    private notifications: Notification[] = [];

    public subscribe(listener: (notes: Notification[]) => void) {
        this.listeners.push(listener);
        listener(this.notifications);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    public addNotification(message: string, type: Notification['type'] = 'info', actionLink?: string) {
        const note: Notification = {
            id: generateId(),
            type,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            actionLink
        };
        this.notifications.unshift(note);
        this.listeners.forEach(l => l([...this.notifications]));
    }

    public markAsRead(id: string) {
        this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
        this.listeners.forEach(l => l([...this.notifications]));
    }

    public clearNotifications() {
        this.notifications = [];
        this.listeners.forEach(l => l([]));
    }
}
export const notificationService = new NotificationService();

// --- AUDIT LOG SERVICE ---
export class AuditLogService {
    public recordEvent(eventType: AuditEventType, entityType: string, entityId: string, message: string, status: 'SUCCESS' | 'FAILURE' = 'SUCCESS') {
        const log: AuditLogEntry = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            actorId: USER_ID,
            eventType,
            entityType,
            entityId,
            payloadHash: btoa(message).slice(0, 16),
            signature: `SIG_${generateId()}`,
            status,
            message
        };
        dataStore.setItem('AuditLog', log);
        console.log(`[Audit Log] ${eventType}: ${message}`);
    }

    public getAllLogs(): AuditLogEntry[] {
        return dataStore.getAllItems<AuditLogEntry>('AuditLog').sort((a,b) => b.timestamp.localeCompare(a.timestamp));
    }
}
export const auditLogService = new AuditLogService();

// --- TOKEN REWARD SERVICE ---
export class TokenRewardService {
    public issueReward(amount: number, type: TokenType, memo: string) {
        const tx: TokenTransaction = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            senderId: SYSTEM_ID,
            receiverId: USER_ID,
            amount,
            tokenType: type,
            memo,
            status: 'COMPLETED'
        };
        dataStore.setItem('TokenTransaction', tx);
        notificationService.addNotification(`You earned ${amount} ${type}!`, 'success');
        auditLogService.recordEvent(AuditEventType.TokenIssued, 'Token', USER_ID, `Issued ${amount} ${type} for ${memo}`);
    }

    public getBalance(type: TokenType): number {
        const txs = dataStore.getAllItems<TokenTransaction>('TokenTransaction');
        return txs.filter(t => t.tokenType === type && t.receiverId === USER_ID).reduce((acc, curr) => acc + curr.amount, 0);
    }
}
export const tokenRewardService = new TokenRewardService();

// --- GEMINI AI SERVICE ---
export class GeminiService {
    private ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    }

    public async analyzeResume(resume: string, jobDesc: string): Promise<AISuggestion[]> {
        const prompt = `Analyze this resume against the job description. Suggest 5 improvements.
        Resume: ${resume}
        Job Description: ${jobDesc}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                suggestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            originalText: { type: Type.STRING },
                            improvedText: { type: Type.STRING },
                            rationale: { type: Type.STRING },
                            category: { type: Type.STRING },
                            severity: { type: Type.STRING, enum: ['Minor', 'Moderate', 'Major'] }
                        },
                        required: ['originalText', 'improvedText', 'rationale', 'category', 'severity']
                    }
                }
            },
            required: ['suggestions']
        };

        const response = await this.ai.models.generateContent({
            model: AI_MODELS.pro,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

        const data = JSON.parse(response.text || '{}');
        const results = (data.suggestions || []).map((s: any) => ({ ...s, id: generateId() }));
        auditLogService.recordEvent(AuditEventType.AITaskCompleted, 'ResumeAnalysis', USER_ID, 'AI Resume Analysis completed');
        return results;
    }

    public async performSkillGapAnalysis(profile: UserProfile, target: string): Promise<SkillAssessmentResult[]> {
        const prompt = `Perform a skill gap analysis for this user profile aiming for: ${target}.
        Profile Skills: ${profile.skills.join(', ')}
        Experience: ${profile.yearsExperience} years as ${profile.currentRole}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                skillGaps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            skill: { type: Type.STRING },
                            category: { type: Type.STRING },
                            currentLevel: { type: Type.NUMBER },
                            targetLevel: { type: Type.NUMBER },
                            gap: { type: Type.NUMBER }
                        },
                        required: ['skill', 'category', 'currentLevel', 'targetLevel', 'gap']
                    }
                }
            },
            required: ['skillGaps']
        };

        const response = await this.ai.models.generateContent({
            model: AI_MODELS.pro,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

        const data = JSON.parse(response.text || '{}');
        auditLogService.recordEvent(AuditEventType.AITaskCompleted, 'SkillGapAnalysis', USER_ID, 'AI Skill Gap Analysis completed');
        return (data.skillGaps || []).map((sg: any) => ({ ...sg, recommendations: [], lastAssessed: new Date().toISOString() }));
    }
}
export const geminiService = new GeminiService();
