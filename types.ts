
export enum CareerStage {
    EntryLevel = "Entry-Level",
    Junior = "Junior",
    MidLevel = "Mid-Level",
    Senior = "Senior",
    Lead = "Lead",
    Manager = "Manager",
    Director = "Director",
    Executive = "Executive"
}

export enum SkillCategory {
    Technical = "Technical",
    Soft = "Soft Skills",
    Management = "Management",
    DomainSpecific = "Domain Specific",
    Tools = "Tools & Technologies",
    Leadership = "Leadership",
    Communication = "Communication",
    ProjectManagement = "Project Management",
    Sales = "Sales",
    Marketing = "Marketing",
    DataScience = "Data Science",
    Cybersecurity = "Cybersecurity",
    CloudComputing = "Cloud Computing"
}

export enum RecommendationType {
    Course = "Course",
    Certification = "Certification",
    Book = "Book",
    NetworkingEvent = "Networking Event",
    Project = "Project Idea",
    Mentor = "Mentor Connection",
    Article = "Article",
    Podcast = "Podcast",
    Workshop = "Workshop",
    Conference = "Conference"
}

export enum JobApplicationStatus {
    Applied = "Applied",
    Interviewing = "Interviewing",
    OfferReceived = "Offer Received",
    Rejected = "Rejected",
    Withdrawn = "Withdrawn",
    Accepted = "Accepted"
}

export enum GoalStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Deferred = 'Deferred',
    Cancelled = 'Cancelled'
}

export enum PriorityLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical'
}

export enum IdentityVerificationLevel {
    None = "None",
    Basic = "Basic",
    Verified = "Verified",
    Enterprise = "Enterprise"
}

export enum AuditEventType {
    ProfileUpdated = "PROFILE_UPDATED",
    GoalCreated = "GOAL_CREATED",
    GoalUpdated = "GOAL_UPDATED",
    GoalDeleted = "GOAL_DELETED",
    AITaskCompleted = "AI_TASK_COMPLETED",
    TokenIssued = "TOKEN_ISSUED",
    TokenTransferred = "TOKEN_TRANSFERRED",
    PaymentProcessed = "PAYMENT_PROCESSED",
    IdentityVerified = "IDENTITY_VERIFIED",
    AccessDenied = "ACCESS_DENIED",
    ApplicationAdded = "APPLICATION_ADDED",
    ApplicationUpdated = "APPLICATION_UPDATED",
    SessionScheduled = "SESSION_SCHEDULED"
}

export enum TokenType {
    CareerCoin = "CareerCoin",
    SkillPoint = "SkillPoint"
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    currentRole: string;
    industry: string;
    yearsExperience: number;
    careerStage: CareerStage;
    skills: string[];
    education: string[];
    certifications: string[];
    desiredRoles: string[];
    desiredIndustry: string;
    salaryExpectationMin: number;
    salaryExpectationMax: number;
    lastUpdated: string;
    resumeText: string;
    linkedInProfileUrl?: string;
    achievements: string[];
    careerVision: string;
    preferredLearningStyles: string[];
    aiModelPreference?: string;
    publicKey: string;
    identityVerificationLevel: IdentityVerificationLevel;
    walletAddress: string;
    signature?: string;
    nonce?: string;
}

export interface CareerGoal {
    id: string;
    title: string;
    description: string;
    targetDate: string;
    status: GoalStatus;
    priority: PriorityLevel;
    relatedSkills: string[];
    actionItems: ActionItem[];
    createdAt: string;
    lastUpdated: string;
    signature?: string;
    nonce?: string;
}

export interface ActionItem {
    id: string;
    goalId: string;
    description: string;
    dueDate: string;
    isCompleted: boolean;
    completedDate?: string;
    notes?: string;
    signature?: string;
    nonce?: string;
}

export interface JobApplication {
    id: string;
    jobTitle: string;
    company: string;
    applicationDate: string;
    status: JobApplicationStatus;
    notes: string;
    jobDescription: string;
    resumeUsed: string;
    coverLetterUsed?: string;
    interviewDates: string[];
    feedbackReceived: string;
    followUpDate: string | null;
    createdAt: string;
    lastUpdated: string;
    signature?: string;
    nonce?: string;
}

export interface AISuggestion {
    id: string;
    originalText: string;
    improvedText: string;
    rationale: string;
    category: string;
    severity: 'Minor' | 'Moderate' | 'Major';
}

export interface SkillAssessmentResult {
    skill: string;
    category: SkillCategory;
    currentLevel: number;
    targetLevel: number;
    gap: number;
    recommendations: LearningResource[];
    lastAssessed: string;
}

export interface LearningResource {
    id: string;
    title: string;
    description: string;
    type: RecommendationType;
    link: string;
    estimatedTime: string;
    cost: 'Free' | 'Paid' | 'Subscription' | 'Mixed';
    provider: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Notification {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    read: boolean;
    actionLink?: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actorId: string;
    eventType: AuditEventType;
    entityType: string;
    entityId: string;
    payloadHash: string;
    signature: string;
    status: 'SUCCESS' | 'FAILURE';
    message: string;
}

export interface TokenTransaction {
    id: string;
    timestamp: string;
    senderId: string;
    receiverId: string;
    amount: number;
    tokenType: TokenType;
    memo?: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface PaymentRecord {
    id: string;
    timestamp: string;
    payerId: string;
    payeeId: string;
    amount: number;
    currency: string;
    memo?: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
}
