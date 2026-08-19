'use client';

import { useState } from 'react';
import {
  X, User, Building2, Users, CheckCircle2,
  Sparkles, Code
} from 'lucide-react';

export interface CosmoDexRegistrationFieldsConfig {
  phone?: { enabled: boolean; required: boolean };
  college_org?: { enabled: boolean; required: boolean };
  degree?: { enabled: boolean; required: boolean };
  branch?: { enabled: boolean; required: boolean };
  year_of_study?: { enabled: boolean; required: boolean };
  city_state?: { enabled: boolean; required: boolean };
  gender?: { enabled: boolean; required: boolean };
  github_url?: { enabled: boolean; required: boolean };
  linkedin_url?: { enabled: boolean; required: boolean };
  portfolio_url?: { enabled: boolean; required: boolean };
  resume_url?: { enabled: boolean; required: boolean };
  coding_handle?: { enabled: boolean; required: boolean };
  preferred_language?: { enabled: boolean; required: boolean };
  referral_source?: { enabled: boolean; required: boolean };
}

export interface CosmoDexRegistrationDetails {
  full_name: string;
  email: string;
  phone?: string;
  gender?: string;
  user_type?: string;
  college_org?: string;
  degree?: string;
  branch?: string;
  year_of_study?: string;
  city_state?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  coding_handle?: string;
  preferred_language?: string;
  referral_source?: string;
}

interface CosmoDexRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    details: CosmoDexRegistrationDetails;
    teamAction?: 'create' | 'join';
    teamName?: string;
    teamCode?: string;
  }) => Promise<void>;
  eventTitle: string;
  isTeamEvent: boolean;
  fieldsConfig?: CosmoDexRegistrationFieldsConfig | null;
  initialEmail?: string;
  initialName?: string;
  submitting: boolean;
  errorMessage?: string;
}

export default function CosmoDexRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  eventTitle,
  isTeamEvent,
  fieldsConfig,
  initialEmail = '',
  initialName = '',
  submitting,
  errorMessage,
}: CosmoDexRegistrationModalProps) {
  // Form State
  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');

  const [userType, setUserType] = useState('College Student');
  const [collegeOrg, setCollegeOrg] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [cityState, setCityState] = useState('');

  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [codingHandle, setCodingHandle] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('C++');
  const [referralSource, setReferralSource] = useState('CosmoDex Platform');

  // Team State
  const [teamAction, setTeamAction] = useState<'create' | 'join'>('create');
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');

  // Validation
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  // Active configuration for each candidate field
  const cfg = {
    phone: { enabled: fieldsConfig?.phone?.enabled ?? true, required: fieldsConfig?.phone?.required ?? true },
    gender: { enabled: fieldsConfig?.gender?.enabled ?? true, required: fieldsConfig?.gender?.required ?? false },
    college_org: { enabled: fieldsConfig?.college_org?.enabled ?? true, required: fieldsConfig?.college_org?.required ?? true },
    degree: { enabled: fieldsConfig?.degree?.enabled ?? true, required: fieldsConfig?.degree?.required ?? false },
    branch: { enabled: fieldsConfig?.branch?.enabled ?? true, required: fieldsConfig?.branch?.required ?? false },
    year_of_study: { enabled: fieldsConfig?.year_of_study?.enabled ?? true, required: fieldsConfig?.year_of_study?.required ?? false },
    city_state: { enabled: fieldsConfig?.city_state?.enabled ?? true, required: fieldsConfig?.city_state?.required ?? true },
    github_url: { enabled: fieldsConfig?.github_url?.enabled ?? true, required: fieldsConfig?.github_url?.required ?? false },
    linkedin_url: { enabled: fieldsConfig?.linkedin_url?.enabled ?? true, required: fieldsConfig?.linkedin_url?.required ?? false },
    portfolio_url: { enabled: fieldsConfig?.portfolio_url?.enabled ?? false, required: fieldsConfig?.portfolio_url?.required ?? false },
    resume_url: { enabled: fieldsConfig?.resume_url?.enabled ?? false, required: fieldsConfig?.resume_url?.required ?? false },
    coding_handle: { enabled: fieldsConfig?.coding_handle?.enabled ?? true, required: fieldsConfig?.coding_handle?.required ?? false },
    preferred_language: { enabled: fieldsConfig?.preferred_language?.enabled ?? true, required: fieldsConfig?.preferred_language?.required ?? false },
    referral_source: { enabled: fieldsConfig?.referral_source?.enabled ?? true, required: fieldsConfig?.referral_source?.required ?? false },
  };

  const hasEducationFields = cfg.college_org.enabled || cfg.degree.enabled || cfg.branch.enabled || cfg.year_of_study.enabled || cfg.city_state.enabled;
  const hasProfileFields = cfg.github_url.enabled || cfg.linkedin_url.enabled || cfg.portfolio_url.enabled || cfg.resume_url.enabled || cfg.coding_handle.enabled || cfg.preferred_language.enabled || cfg.referral_source.enabled;

  const validateAndSubmit = async () => {
    // 1. Personal
    if (!fullName.trim()) { setFormError('Please enter your full name'); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setFormError('Please enter a valid email address'); return; }
    if (cfg.phone.enabled && cfg.phone.required && (!phone.trim() || phone.length < 8)) {
      setFormError('Please enter a valid phone number');
      return;
    }
    if (cfg.gender.enabled && cfg.gender.required && !gender) {
      setFormError('Please select your gender');
      return;
    }

    // 2. Education
    if (cfg.college_org.enabled && cfg.college_org.required && !collegeOrg.trim()) {
      setFormError('Please enter your college, university, or organization');
      return;
    }
    if (cfg.degree.enabled && cfg.degree.required && !degree.trim()) {
      setFormError('Please enter your degree');
      return;
    }
    if (cfg.branch.enabled && cfg.branch.required && !branch.trim()) {
      setFormError('Please enter your branch / specialization');
      return;
    }
    if (cfg.city_state.enabled && cfg.city_state.required && !cityState.trim()) {
      setFormError('Please enter your city and state');
      return;
    }

    // 3. Profiles
    if (cfg.github_url.enabled && cfg.github_url.required && !githubUrl.trim()) {
      setFormError('Please enter your GitHub profile URL'); return;
    }
    if (cfg.linkedin_url.enabled && cfg.linkedin_url.required && !linkedinUrl.trim()) {
      setFormError('Please enter your LinkedIn profile URL'); return;
    }
    if (cfg.portfolio_url.enabled && cfg.portfolio_url.required && !portfolioUrl.trim()) {
      setFormError('Please enter your Portfolio URL'); return;
    }
    if (cfg.resume_url.enabled && cfg.resume_url.required && !resumeUrl.trim()) {
      setFormError('Please enter your Resume drive link'); return;
    }
    if (cfg.coding_handle.enabled && cfg.coding_handle.required && !codingHandle.trim()) {
      setFormError('Please enter your programming handle (e.g. Codeforces / LeetCode)');
      return;
    }

    // 4. Team
    if (isTeamEvent) {
      if (teamAction === 'create' && !teamName.trim()) {
        setFormError('Please enter a team name');
        return;
      }
      if (teamAction === 'join' && !teamCode.trim()) {
        setFormError('Please enter your team code');
        return;
      }
    }

    setFormError('');

    const details: CosmoDexRegistrationDetails = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: cfg.phone.enabled ? phone.trim() : undefined,
      gender: cfg.gender.enabled ? gender : undefined,
      user_type: hasEducationFields ? userType : undefined,
      college_org: cfg.college_org.enabled ? collegeOrg.trim() : undefined,
      degree: cfg.degree.enabled ? degree.trim() : undefined,
      branch: cfg.branch.enabled ? branch.trim() : undefined,
      year_of_study: cfg.year_of_study.enabled ? yearOfStudy : undefined,
      city_state: cfg.city_state.enabled ? cityState.trim() : undefined,
      github_url: cfg.github_url.enabled ? (githubUrl.trim() || undefined) : undefined,
      linkedin_url: cfg.linkedin_url.enabled ? (linkedinUrl.trim() || undefined) : undefined,
      portfolio_url: cfg.portfolio_url.enabled ? (portfolioUrl.trim() || undefined) : undefined,
      resume_url: cfg.resume_url.enabled ? (resumeUrl.trim() || undefined) : undefined,
      coding_handle: cfg.coding_handle.enabled ? (codingHandle.trim() || undefined) : undefined,
      preferred_language: cfg.preferred_language.enabled ? preferredLanguage : undefined,
      referral_source: cfg.referral_source.enabled ? referralSource : undefined,
    };

    await onSubmit({
      details,
      teamAction: isTeamEvent ? teamAction : undefined,
      teamName: isTeamEvent && teamAction === 'create' ? teamName.trim() : undefined,
      teamCode: isTeamEvent && teamAction === 'join' ? teamCode.trim().toUpperCase() : undefined,
    });
  };

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors";
  const selectClass = "w-full bg-[#0b0717] border border-white/[0.1] rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-[#E873C3] transition-colors [color-scheme:dark] cursor-pointer";
  const labelClass = "text-[11px] font-bold text-white/70 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0717] border border-white/[0.12] rounded-3xl max-w-xl w-full flex flex-col shadow-2xl relative overflow-hidden my-6">

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#E873C3] via-[#a84dc2] to-[#8D37D6] p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80 mb-0.5">
            <Sparkles size={13} /> Event Registration
          </div>
          <h2 className="text-lg font-black text-white">{eventTitle}</h2>
          <p className="text-xs text-white/80">Confirm your participation details</p>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
          {(formError || errorMessage) && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
              {formError || errorMessage}
            </div>
          )}

          {/* Team Setup (If Team Event) */}
          {isTeamEvent && (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-[#E873C3]" /> Team Setup
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTeamAction('create')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${teamAction === 'create'
                      ? 'bg-[#E873C3]/15 border-[#E873C3] text-white'
                      : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.05]'
                    }`}
                >
                  <span className="text-xs font-bold">Create Team</span>
                  <span className="text-[10px] text-white/60">Generate invite code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTeamAction('join')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${teamAction === 'join'
                      ? 'bg-[#E873C3]/15 border-[#E873C3] text-white'
                      : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.05]'
                    }`}
                >
                  <span className="text-xs font-bold">Join Team</span>
                  <span className="text-[10px] text-white/60">Enter team code</span>
                </button>
              </div>

              {teamAction === 'create' ? (
                <div>
                  <label className={labelClass}>Team Name *</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team name"
                    className={inputClass}
                  />
                </div>
              ) : (
                <div>
                  <label className={labelClass}>Team Invite Code *</label>
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                    placeholder="e.g. TM-8X92K"
                    className={inputClass + " font-mono uppercase tracking-wider"}
                  />
                </div>
              )}
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-[#E873C3]" /> Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className={inputClass}
                />
              </div>

              {cfg.phone.enabled && (
                <div>
                  <label className={labelClass}>Mobile Number {cfg.phone.required ? '*' : ''}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className={inputClass}
                  />
                </div>
              )}

              {cfg.gender.enabled && (
                <div>
                  <label className={labelClass}>Gender {cfg.gender.required ? '*' : ''}</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={selectClass}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer Not To Say">Prefer Not To Say</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Academic / Organization (If enabled) */}
          {hasEducationFields && (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={14} className="text-[#E873C3]" /> Organization & Education
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Participant Category</label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className={selectClass}
                  >
                    <option value="College Student">College Student</option>
                    <option value="School Student">School Student</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Fresher / Job Seeker">Fresher / Job Seeker</option>
                  </select>
                </div>

                {cfg.college_org.enabled && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>College / Organization {cfg.college_org.required ? '*' : ''}</label>
                    <input
                      type="text"
                      value={collegeOrg}
                      onChange={(e) => setCollegeOrg(e.target.value)}
                      placeholder="Institute or company name"
                      className={inputClass}
                    />
                  </div>
                )}

                {cfg.degree.enabled && (
                  <div>
                    <label className={labelClass}>Degree {cfg.degree.required ? '*' : ''}</label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="e.g. B.Tech / B.Sc"
                      className={inputClass}
                    />
                  </div>
                )}

                {cfg.year_of_study.enabled && (
                  <div>
                    <label className={labelClass}>Year of Study {cfg.year_of_study.required ? '*' : ''}</label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className={selectClass}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </div>
                )}

                {cfg.branch.enabled && (
                  <div>
                    <label className={labelClass}>Branch / Specialization {cfg.branch.required ? '*' : ''}</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className={inputClass}
                    />
                  </div>
                )}

                {cfg.city_state.enabled && (
                  <div>
                    <label className={labelClass}>City & State {cfg.city_state.required ? '*' : ''}</label>
                    <input
                      type="text"
                      value={cityState}
                      onChange={(e) => setCityState(e.target.value)}
                      placeholder="e.g. Mumbai, Maharashtra"
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coding & Profiles (If enabled) */}
          {hasProfileFields && (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Code size={14} className="text-[#E873C3]" /> Profiles & Handles
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cfg.github_url.enabled && (
                  <div>
                    <label className={labelClass}>GitHub Profile {cfg.github_url.required ? '*' : ''}</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className={inputClass}
                    />
                  </div>
                )}

                {cfg.linkedin_url.enabled && (
                  <div>
                    <label className={labelClass}>LinkedIn Profile {cfg.linkedin_url.required ? '*' : ''}</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className={inputClass}
                    />
                  </div>
                )}

                {cfg.portfolio_url.enabled && (
                  <div>
                    <label className={labelClass}>Portfolio URL {cfg.portfolio_url.required ? '*' : ''}</label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className={inputClass}
                    />
                  </div>
                )}

                {cfg.resume_url.enabled && (
                  <div>
                    <label className={labelClass}>Resume Drive Link {cfg.resume_url.required ? '*' : ''}</label>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className={inputClass}
                    />
                  </div>
                )}

                {cfg.coding_handle.enabled && (
                  <div>
                    <label className={labelClass}>Coding Handle {cfg.coding_handle.required ? '*' : ''}</label>
                    <input
                      type="text"
                      value={codingHandle}
                      onChange={(e) => setCodingHandle(e.target.value)}
                      placeholder="e.g. tourist / leetcoder"
                      className={inputClass}
                    />
                  </div>
                )}

                {cfg.preferred_language.enabled && (
                  <div>
                    <label className={labelClass}>Preferred Language {cfg.preferred_language.required ? '*' : ''}</label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className={selectClass}
                    >
                      <option value="C++">C++ 20</option>
                      <option value="Python">Python 3.11</option>
                      <option value="Java">Java 21</option>
                      <option value="JavaScript">JavaScript / TypeScript</option>
                      <option value="Go">Go</option>
                      <option value="Rust">Rust</option>
                    </select>
                  </div>
                )}

                {cfg.referral_source.enabled && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>How did you hear about this event? {cfg.referral_source.required ? '*' : ''}</label>
                    <select
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      className={selectClass}
                    >
                      <option value="CosmoDex Platform">CosmoDex Platform</option>
                      <option value="College Club / Society">College Club / Society</option>
                      <option value="LinkedIn / Social Media">LinkedIn / Social Media</option>
                      <option value="Friends / Classmates">Friends / Classmates</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Controls Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-black/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={validateAndSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/25 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>Registering...</>
            ) : (
              <>Complete Registration <CheckCircle2 size={14} /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
