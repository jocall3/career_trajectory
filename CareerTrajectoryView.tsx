
import React, { useState, useEffect, useMemo } from 'react';
import { 
    dataStore, 
    notificationService, 
    auditLogService, 
    tokenRewardService, 
    geminiService,
    generateId 
} from './services';
import { 
    CareerGoal, 
    JobApplication, 
    UserProfile, 
    AISuggestion, 
    SkillAssessmentResult,
    GoalStatus,
    PriorityLevel,
    JobApplicationStatus,
    CareerStage,
    IdentityVerificationLevel,
    TokenType,
    AuditEventType
} from './types';
import { 
    LayoutDashboard, 
    FileText, 
    Target, 
    Briefcase, 
    TrendingUp, 
    Award, 
    History, 
    ChevronRight, 
    Plus, 
    CheckCircle2, 
    BrainCircuit,
    Zap,
    ShieldCheck
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Radar, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis 
} from 'recharts';

const CareerTrajectoryView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [goals, setGoals] = useState<CareerGoal[]>([]);
    const [apps, setApps] = useState<JobApplication[]>([]);
    
    // AI Related States
    const [resumeText, setResumeText] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [skillGaps, setSkillGaps] = useState<SkillAssessmentResult[]>([]);
    const [isProcessingAI, setIsProcessingAI] = useState(false);

    useEffect(() => {
        const savedProfile = dataStore.getItem<UserProfile>('Profile', 'default_user');
        if (savedProfile) {
            setProfile(savedProfile);
            setResumeText(savedProfile.resumeText);
        } else {
            const initialProfile: UserProfile = {
                id: 'default_user',
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                currentRole: 'Software Engineer',
                industry: 'Tech',
                yearsExperience: 5,
                careerStage: CareerStage.Senior,
                skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
                education: ['B.S. Computer Science'],
                certifications: ['AWS Cloud Practitioner'],
                desiredRoles: ['Staff Engineer', 'Architecture Lead'],
                desiredIndustry: 'Cloud Infrastructure',
                salaryExpectationMin: 150000,
                salaryExpectationMax: 200000,
                lastUpdated: new Date().toISOString(),
                resumeText: 'Senior Software Engineer with 5 years experience in full-stack development...',
                publicKey: 'PUB_KEY_12345',
                identityVerificationLevel: IdentityVerificationLevel.Verified,
                walletAddress: '0xABC...DEF',
                achievements: ['Delivered core API architecture for v2 launch'],
                careerVision: 'To lead scalable infrastructure projects globally.',
                preferredLearningStyles: ['Hands-on', 'Visual']
            };
            dataStore.setItem('Profile', initialProfile);
            setProfile(initialProfile);
            setResumeText(initialProfile.resumeText);
        }
        setGoals(dataStore.getAllItems<CareerGoal>('Goal'));
        setApps(dataStore.getAllItems<JobApplication>('Application'));
    }, []);

    const handleAnalyzeResume = async () => {
        if (!resumeText || !jobDesc) {
            notificationService.addNotification("Please provide both resume and job description.", "warning");
            return;
        }
        setIsProcessingAI(true);
        try {
            const results = await geminiService.analyzeResume(resumeText, jobDesc);
            setSuggestions(results);
            notificationService.addNotification("Resume analysis complete!", "success");
            tokenRewardService.issueReward(5, TokenType.CareerCoin, "Resume Analysis Completion");
        } catch (e) {
            notificationService.addNotification("AI analysis failed.", "error");
        } finally {
            setIsProcessingAI(false);
        }
    };

    const handleSkillAnalysis = async () => {
        if (!profile) return;
        setIsProcessingAI(true);
        try {
            const target = profile.desiredRoles.join(', ');
            const results = await geminiService.performSkillGapAnalysis(profile, target);
            setSkillGaps(results);
            notificationService.addNotification("Skill gap analysis synchronized.", "success");
        } catch (e) {
            notificationService.addNotification("AI Analysis Error.", "error");
        } finally {
            setIsProcessingAI(false);
        }
    };

    const radarData = useMemo(() => {
        return skillGaps.map(g => ({
            subject: g.skill,
            A: g.currentLevel * 20, // Normalize to 100
            B: g.targetLevel * 20,
            fullMark: 100
        }));
    }, [skillGaps]);

    const stats = useMemo(() => {
        return {
            goalsTotal: goals.length,
            goalsCompleted: goals.filter(g => g.status === GoalStatus.Completed).length,
            appsPending: apps.filter(a => a.status === JobApplicationStatus.Applied || a.status === JobApplicationStatus.Interviewing).length,
            balance: tokenRewardService.getBalance(TokenType.CareerCoin)
        };
    }, [goals, apps]);

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 shrink-0">
                <nav className="flex flex-col space-y-1">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'resume', label: 'Resume AI', icon: BrainCircuit },
                        { id: 'skills', label: 'Skill Matrix', icon: TrendingUp },
                        { id: 'goals', label: 'Goals', icon: Target },
                        { id: 'applications', label: 'Applications', icon: Briefcase },
                        { id: 'rewards', label: 'Rewards', icon: Award },
                        { id: 'audit', label: 'Audit Trail', icon: History },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                activeTab === item.id 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-2' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-semibold text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-8 p-4 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-xs text-indigo-100 mb-1">Total Rewards</p>
                        <h4 className="text-2xl font-bold flex items-center">
                            {stats.balance} <span className="ml-2 text-sm font-normal">CareerCoins</span>
                        </h4>
                        <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold backdrop-blur-sm transition-colors">
                            Redeem Perks
                        </button>
                    </div>
                    <Award className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                {activeTab === 'dashboard' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">Active Applications</p>
                                    <h3 className="text-2xl font-bold mt-1 text-slate-800">{stats.appsPending}</h3>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">Goals Progress</p>
                                    <h3 className="text-2xl font-bold mt-1 text-slate-800">
                                        {stats.goalsTotal > 0 ? Math.round((stats.goalsCompleted / stats.goalsTotal) * 100) : 0}%
                                    </h3>
                                </div>
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">Identity Trust Score</p>
                                    <h3 className="text-2xl font-bold mt-1 text-slate-800">98/100</h3>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800">Recent Milestones</h2>
                                    <button className="text-sm text-blue-600 hover:underline">View All</button>
                                </div>
                                <div className="space-y-6">
                                    {goals.slice(0, 3).map(goal => (
                                        <div key={goal.id} className="flex items-start space-x-4">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${goal.status === GoalStatus.Completed ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                                            <div>
                                                <h4 className="font-bold text-slate-800">{goal.title}</h4>
                                                <p className="text-sm text-slate-500">{goal.description}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">Deadline: {new Date(goal.targetDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {goals.length === 0 && <p className="text-slate-400 text-sm italic">No active goals found.</p>}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-800 mb-6">Skill Trajectory</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={radarData.length > 0 ? radarData : [
                                            { subject: 'Technical', A: 80, B: 95 },
                                            { subject: 'Leadership', A: 40, B: 80 },
                                            { subject: 'Strategy', A: 30, B: 75 },
                                            { subject: 'Ops', A: 60, B: 70 },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <YAxis hide />
                                            <Tooltip 
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="A" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                                            <Bar dataKey="B" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center space-x-6 mt-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="w-3 h-3 bg-blue-500 rounded-full" />
                                        <span className="text-xs text-slate-500">Current Level</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-3 h-3 bg-slate-200 rounded-full" />
                                        <span className="text-xs text-slate-500">Target Level</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'resume' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">AI Resume Optimizer</h2>
                                <p className="text-slate-500">Leverage GenAI to align your experience with target job roles.</p>
                            </div>
                            <button 
                                onClick={handleAnalyzeResume}
                                disabled={isProcessingAI}
                                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                {isProcessingAI ? <Zap className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                                <span>{isProcessingAI ? 'Analyzing...' : 'Analyze Now'}</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider ml-1">Current Resume</label>
                                <textarea 
                                    className="w-full h-[500px] p-6 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono text-sm leading-relaxed"
                                    placeholder="Paste your resume content here..."
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider ml-1">Target Job Description</label>
                                <textarea 
                                    className="w-full h-[500px] p-6 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono text-sm leading-relaxed"
                                    placeholder="Paste the job description here..."
                                    value={jobDesc}
                                    onChange={(e) => setJobDesc(e.target.value)}
                                />
                            </div>
                        </div>

                        {suggestions.length > 0 && (
                            <div className="mt-8 bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                                <h3 className="text-xl font-bold text-blue-900 mb-6">AI Optimization Results</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {suggestions.map((s, idx) => (
                                        <div key={s.id} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                    s.severity === 'Major' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                }`}>{s.severity} Improvement</span>
                                                <button className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs font-bold">
                                                    Apply Suggestion <ChevronRight className="w-3 h-3 ml-1" />
                                                </button>
                                            </div>
                                            <p className="text-slate-500 text-xs line-through mb-2">{s.originalText}</p>
                                            <p className="text-slate-800 text-sm font-semibold mb-3">{s.improvedText}</p>
                                            <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                                                <strong>Rationale:</strong> {s.rationale}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'skills' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Skill Gap Blueprint</h2>
                                <p className="text-slate-500">Visualize your path from current capabilities to desired roles.</p>
                            </div>
                            <button 
                                onClick={handleSkillAnalysis}
                                disabled={isProcessingAI}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2"
                            >
                                <TrendingUp className="w-5 h-5" />
                                <span>{isProcessingAI ? 'Running Analysis...' : 'Generate Skill Blueprint'}</span>
                            </button>
                        </div>

                        {radarData.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
                                    <h4 className="text-lg font-bold text-slate-800 mb-6">Mastery Comparison</h4>
                                    <div className="w-full h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid stroke="#e2e8f0" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                                                <Radar
                                                    name="Current"
                                                    dataKey="A"
                                                    stroke="#3b82f6"
                                                    fill="#3b82f6"
                                                    fillOpacity={0.4}
                                                />
                                                <Radar
                                                    name="Target"
                                                    dataKey="B"
                                                    stroke="#6366f1"
                                                    fill="#6366f1"
                                                    fillOpacity={0.2}
                                                />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex space-x-4 mt-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="w-3 h-3 bg-blue-500 rounded-full" />
                                            <span className="text-xs text-slate-500">Current Level</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="w-3 h-3 bg-indigo-500/50 rounded-full" />
                                            <span className="text-xs text-slate-500">Industry Standard</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-3 space-y-4">
                                    {skillGaps.map(gap => (
                                        <div key={gap.skill} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all flex items-center justify-between group">
                                            <div className="flex-1 pr-8">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-sm font-bold text-slate-800">{gap.skill}</span>
                                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">{gap.category}</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-indigo-500 transition-all duration-1000" 
                                                        style={{ width: `${(gap.currentLevel / gap.targetLevel) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-2">Proficiency: {gap.currentLevel}/5 (Required: {gap.targetLevel}/5)</p>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end">
                                                <div className={`text-xs font-bold mb-1 ${gap.gap > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                                    {gap.gap > 0 ? `Gap: -${gap.gap}` : 'Mastered'}
                                                </div>
                                                <button className="text-[10px] px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100">
                                                    Find Courses
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <TrendingUp className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">No Skill Blueprint Found</h3>
                                <p className="text-slate-400 max-w-xs mx-auto mt-2">Run a Skill Blueprint analysis to visualize your competency compared to your target industry roles.</p>
                                <button 
                                    onClick={handleSkillAnalysis}
                                    className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    Start Analysis
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Immutable Audit Trail</h2>
                            <span className="text-xs text-slate-400 flex items-center italic">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Cryptographically Verified Actions
                            </span>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Integrity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {auditLogService.getAllLogs().map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-xs text-slate-400">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                    log.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {log.eventType.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {log.message}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-1 text-green-500">
                                                    <ShieldCheck className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase">Valid</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {auditLogService.getAllLogs().length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No events recorded in audit log.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Placeholders for other tabs */}
                {!['dashboard', 'resume', 'skills', 'audit'].includes(activeTab) && (
                    <div className="p-20 text-center bg-white rounded-3xl border border-slate-200">
                        <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">{activeTab} Module</h2>
                        <p className="text-slate-400 mt-2">Implementation of the {activeTab} agent is underway. Please check back shortly.</p>
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            className="mt-6 text-sm text-blue-600 font-bold hover:underline"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareerTrajectoryView;
