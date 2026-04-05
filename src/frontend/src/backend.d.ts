import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ScriptSection {
    title: string;
    content: string;
}
export interface Channel {
    id: ID;
    owner: Principal;
    name: string;
    description: string;
    targetAudience: string;
    uploadFrequency: string;
    niche: Niche;
}
export interface VideoScript {
    id: ID;
    title: string;
    topic: string;
    owner: Principal;
    body: ScriptSection;
    hook: ScriptSection;
    createdAt: bigint;
    tone: ScriptTone;
    callToAction: ScriptSection;
    niche: Niche;
    intro: ScriptSection;
}
export interface RevenueEntry {
    id: ID;
    channelId: ID;
    source: RevenueSource;
    owner: Principal;
    date: bigint;
    description: string;
    currency: string;
    amount: number;
}
export interface DashboardStats {
    totalViews: bigint;
    totalVideos: bigint;
    totalSubscribers: bigint;
    totalIdeas: bigint;
    totalRevenue: number;
}
export type ID = bigint;
export interface AnalyticsSnapshot {
    id: ID;
    monthlyViews: bigint;
    channelId: ID;
    owner: Principal;
    totalViews: bigint;
    date: bigint;
    subscribers: bigint;
    monthlyRevenue: number;
}
export type Niche = {
    __kind__: "finance";
    finance: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "entertainment";
    entertainment: null;
} | {
    __kind__: "food";
    food: null;
} | {
    __kind__: "travel";
    travel: null;
} | {
    __kind__: "tech";
    tech: null;
} | {
    __kind__: "education";
    education: null;
} | {
    __kind__: "gaming";
    gaming: null;
} | {
    __kind__: "lifestyle";
    lifestyle: null;
} | {
    __kind__: "health";
    health: null;
};
export interface ContentIdea {
    id: ID;
    status: ScriptStatus;
    title: string;
    owner: Principal;
    createdAt: bigint;
    tags: Array<string>;
    description: string;
    niche: Niche;
}
export interface UserProfileView {
    scripts: Array<ID>;
    revenueEntries: Array<ID>;
    name: string;
    createdAt: bigint;
    analyticsSnapshots: Array<ID>;
    channels: Array<ID>;
    contentIdeas: Array<ID>;
}
export type ScriptTone = {
    __kind__: "review";
    review: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "educational";
    educational: null;
} | {
    __kind__: "entertaining";
    entertaining: null;
} | {
    __kind__: "tutorial";
    tutorial: null;
} | {
    __kind__: "informative";
    informative: null;
} | {
    __kind__: "motivational";
    motivational: null;
} | {
    __kind__: "commentary";
    commentary: null;
} | {
    __kind__: "storytelling";
    storytelling: null;
};
export type RevenueSource = {
    __kind__: "sponsorship";
    sponsorship: null;
} | {
    __kind__: "merchandise";
    merchandise: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "adsense";
    adsense: null;
} | {
    __kind__: "affiliate";
    affiliate: null;
};
export enum ScriptStatus {
    scripted = "scripted",
    idea = "idea",
    published = "published",
    recorded = "recorded",
    archived = "archived"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAnalyticsSnapshot(channelId: ID, subs: bigint, totalViews: bigint, monthlyViews: bigint, monthlyRevenue: number, date: bigint): Promise<AnalyticsSnapshot>;
    createChannel(name: string, niche: Niche, desc: string, uploadFreq: string, targetAudience: string): Promise<Channel>;
    createContentIdea(title: string, desc: string, tags: Array<string>, niche: Niche, status: ScriptStatus): Promise<ContentIdea>;
    createRevenueEntry(channelId: ID, source: RevenueSource, amount: number, currency: string, date: bigint, desc: string): Promise<RevenueEntry>;
    createVideoScript(title: string, niche: Niche, tone: ScriptTone, topic: string, hook: ScriptSection, intro: ScriptSection, body: ScriptSection, callToAction: ScriptSection): Promise<VideoScript>;
    deleteAnalyticsSnapshot(id: ID): Promise<void>;
    deleteChannel(id: ID): Promise<void>;
    deleteContentIdea(id: ID): Promise<void>;
    deleteRevenueEntry(id: ID): Promise<void>;
    deleteVideoScript(id: ID): Promise<void>;
    getAllAnalyticsSnapshots(): Promise<Array<AnalyticsSnapshot>>;
    getAllChannels(): Promise<Array<Channel>>;
    getAllContentIdeas(): Promise<Array<ContentIdea>>;
    getAllRevenueEntries(): Promise<Array<RevenueEntry>>;
    getAllVideoScripts(): Promise<Array<VideoScript>>;
    getAnalyticsSnapshot(id: ID): Promise<AnalyticsSnapshot>;
    getCallerUserProfile(): Promise<UserProfileView>;
    getCallerUserRole(): Promise<UserRole>;
    getChannel(id: ID): Promise<Channel>;
    getContentIdea(id: ID): Promise<ContentIdea>;
    getDashboardStats(): Promise<DashboardStats>;
    getMyAnalyticsSnapshots(): Promise<Array<AnalyticsSnapshot>>;
    getMyChannels(): Promise<Array<Channel>>;
    getMyContentIdeas(): Promise<Array<ContentIdea>>;
    getMyRevenueEntries(): Promise<Array<RevenueEntry>>;
    getMyVideoScripts(): Promise<Array<VideoScript>>;
    getRevenueEntry(id: ID): Promise<RevenueEntry>;
    getUserProfile(user: Principal): Promise<UserProfileView>;
    getVideoScript(id: ID): Promise<VideoScript>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfileView): Promise<void>;
    updateAnalyticsSnapshot(id: ID, channelId: ID, subs: bigint, totalViews: bigint, monthlyViews: bigint, monthlyRevenue: number, date: bigint): Promise<AnalyticsSnapshot>;
    updateChannel(id: ID, name: string, niche: Niche, desc: string, uploadFreq: string, targetAudience: string): Promise<Channel>;
    updateContentIdea(id: ID, title: string, desc: string, tags: Array<string>, niche: Niche, status: ScriptStatus): Promise<ContentIdea>;
    updateRevenueEntry(id: ID, channelId: ID, source: RevenueSource, amount: number, currency: string, date: bigint, desc: string): Promise<RevenueEntry>;
    updateVideoScript(id: ID, title: string, niche: Niche, tone: ScriptTone, topic: string, hook: ScriptSection, intro: ScriptSection, body: ScriptSection, callToAction: ScriptSection): Promise<VideoScript>;
}
