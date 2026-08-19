'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Mail, Phone, Building2, GraduationCap, MapPin,
  Github, Linkedin, Users, ArrowRight, ArrowLeft, CheckCircle2,
  Sparkles, Code, Globe
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

export interface CosmoDexRegistrationModalProps {
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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (modalRef.current && !modalRef.current.contains(target)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

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

  // Lock background body scroll and pre-fill saved candidate profile from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      try {
        const saved = localStorage.getItem('cosmodex_saved_candidate_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.full_name && !initialName) setFullName(parsed.full_name);
          if (parsed.email && !initialEmail) setEmail(parsed.email);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.gender) setGender(parsed.gender);
          if (parsed.user_type) setUserType(parsed.user_type);
          if (parsed.college_org) setCollegeOrg(parsed.college_org);
          if (parsed.degree) setDegree(parsed.degree);
          if (parsed.branch) setBranch(parsed.branch);
          if (parsed.year_of_study) setYearOfStudy(parsed.year_of_study);
          if (parsed.city_state) setCityState(parsed.city_state);
          if (parsed.github_url) setGithubUrl(parsed.github_url);
          if (parsed.linkedin_url) setLinkedinUrl(parsed.linkedin_url);
          if (parsed.portfolio_url) setPortfolioUrl(parsed.portfolio_url);
          if (parsed.resume_url) setResumeUrl(parsed.resume_url);
          if (parsed.coding_handle) setCodingHandle(parsed.coding_handle);
          if (parsed.preferred_language) setPreferredLanguage(parsed.preferred_language);
          if (parsed.referral_source) setReferralSource(parsed.referral_source);
        }
      } catch (e) {
        console.error('Failed to load saved candidate profile cache:', e);
      }

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, initialName, initialEmail]);

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

  const hasStep2Fields = cfg.college_org.enabled || cfg.degree.enabled || cfg.branch.enabled || cfg.year_of_study.enabled || cfg.city_state.enabled;
  const hasStep3Fields = cfg.github_url.enabled || cfg.linkedin_url.enabled || cfg.portfolio_url.enabled || cfg.resume_url.enabled || cfg.coding_handle.enabled || cfg.preferred_language.enabled || cfg.referral_source.enabled;

  const validateStep1 = () => {
    if (!fullName.trim()) { setFormError('Please enter your full name'); return false; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setFormError('Please enter a valid email address'); return false; }
    if (cfg.phone.enabled && cfg.phone.required && (!phone.trim() || phone.length < 8)) {
      setFormError('Please enter a valid phone number');
      return false;
    }
    if (cfg.gender.enabled && cfg.gender.required && !gender) {
      setFormError('Please select your gender');
      return false;
    }
    setFormError('');
    return true;
  };

  const validateStep2 = () => {
    if (cfg.college_org.enabled && cfg.college_org.required && !collegeOrg.trim()) {
      setFormError('Please enter your college, university, or organization');
      return false;
    }
    if (cfg.degree.enabled && cfg.degree.required && !degree.trim()) {
      setFormError('Please enter your degree');
      return false;
    }
    if (cfg.branch.enabled && cfg.branch.required && !branch.trim()) {
      setFormError('Please enter your branch / specialization');
      return false;
    }
    if (cfg.city_state.enabled && cfg.city_state.required && !cityState.trim()) {
      setFormError('Please enter your city and state');
      return false;
    }
    setFormError('');
    return true;
  };

  const validateStep3 = () => {
    if (cfg.github_url.enabled && cfg.github_url.required && !githubUrl.trim()) {
      setFormError('Please enter your GitHub profile URL'); return false;
    }
    if (cfg.linkedin_url.enabled && cfg.linkedin_url.required && !linkedinUrl.trim()) {
      setFormError('Please enter your LinkedIn profile URL'); return false;
    }
    if (cfg.portfolio_url.enabled && cfg.portfolio_url.required && !portfolioUrl.trim()) {
      setFormError('Please enter your Portfolio URL'); return false;
    }
    if (cfg.resume_url.enabled && cfg.resume_url.required && !resumeUrl.trim()) {
      setFormError('Please enter your Resume drive link'); return false;
    }
    if (cfg.coding_handle.enabled && cfg.coding_handle.required && !codingHandle.trim()) {
      setFormError('Please enter your programming handle (e.g. Codeforces / LeetCode)');
      return false;
    }
    setFormError('');
    return true;
  };

  const validateStep4 = () => {
    if (isTeamEvent) {
      if (teamAction === 'create' && !teamName.trim()) {
        setFormError('Please enter a team name');
        return false;
      }
      if (teamAction === 'join' && !teamCode.trim()) {
        setFormError('Please enter your team code');
        return false;
      }
    }
    setFormError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      if (hasStep2Fields) setStep(2);
      else if (hasStep3Fields) setStep(3);
      else if (isTeamEvent) setStep(4);
      else handleSubmitFinal();
    } else if (step === 2 && validateStep2()) {
      if (hasStep3Fields) setStep(3);
      else if (isTeamEvent) setStep(4);
      else handleSubmitFinal();
    } else if (step === 3 && validateStep3()) {
      if (isTeamEvent) setStep(4);
      else handleSubmitFinal();
    }
  };

  const handleBack = () => {
    setFormError('');
    if (step === 4) {
      if (hasStep3Fields) setStep(3);
      else if (hasStep2Fields) setStep(2);
      else setStep(1);
    } else if (step === 3) {
      if (hasStep2Fields) setStep(2);
      else setStep(1);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmitFinal = async () => {
    if (isTeamEvent && step === 4 && !validateStep4()) return;

    const details: CosmoDexRegistrationDetails = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: cfg.phone.enabled ? phone.trim() : undefined,
      gender: cfg.gender.enabled ? gender : undefined,
      user_type: hasStep2Fields ? userType : undefined,
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

    // Save profile details to localStorage cache so future registrations pre-fill automatically
    try {
      localStorage.setItem('cosmodex_saved_candidate_profile', JSON.stringify(details));
    } catch (e) {
      console.error('Failed to save candidate profile to localStorage:', e);
    }

    await onSubmit({
      details,
      teamAction: isTeamEvent ? teamAction : undefined,
      teamName: isTeamEvent && teamAction === 'create' ? teamName.trim() : undefined,
      teamCode: isTeamEvent && teamAction === 'join' ? teamCode.trim().toUpperCase() : undefined,
    });
  };

  // Determine active steps dynamically
  const activeSteps: { num: 1 | 2 | 3 | 4; label: string }[] = [{ num: 1, label: 'Personal' }];
  if (hasStep2Fields) activeSteps.push({ num: 2, label: 'Academic' });
  if (hasStep3Fields) activeSteps.push({ num: 3, label: 'Profiles' });
  if (isTeamEvent) activeSteps.push({ num: 4, label: 'Team' });

  const totalSteps = activeSteps.length;
  const currentStepIndex = activeSteps.findIndex(s => s.num === step);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-hidden select-none"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          className="bg-[#0b0717] border border-white/[0.15] rounded-3xl max-w-xl w-full flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(232,115,195,0.25)] relative overflow-hidden my-auto shrink-0 select-text"
        >

          {/* Top Header Banner */}
          <div className="bg-gradient-to-r from-[#E873C3] via-[#a84dc2] to-[#8D37D6] p-6 text-white relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 mb-1">
              <Sparkles size={14} /> CosmoDex Candidate Pass
            </div>
            <h2 className="text-xl font-black text-white">{eventTitle}</h2>
            <p className="text-xs text-white/80 mt-1">Complete your official event registration details</p>
          </div>

          {/* Progress Bar & Indicators */}
          <div className="px-6 pt-5 pb-2 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center justify-between mb-2">
              {activeSteps.map(({ num, label }) => (
                <div key={num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === num
                        ? 'bg-[#E873C3] text-white shadow-lg shadow-[#E873C3]/30 scale-110'
                        : step > num
                          ? 'bg-[#3DCB7F] text-black font-extrabold'
                          : 'bg-white/[0.08] text-white/40'
                    }`}
                  >
                    {step > num ? <CheckCircle2 size={15} /> : num}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:inline ${step === num ? 'text-white' : 'text-white/40'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#E873C3] h-full transition-all duration-300 ease-out"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Body Form */}
          <div
            onWheel={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#E873C3 rgba(255, 255, 255, 0.05)',
            }}
            className="p-6 overflow-y-auto max-h-[50vh] sm:max-h-[55vh] flex flex-col gap-4 relative overscroll-contain scroll-smooth"
          >
            {(formError || errorMessage) && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
                {formError || errorMessage}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* STEP 1: Personal Information */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex flex-col gap-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <User size={16} className="text-[#E873C3]" /> Personal Information
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-white/70 mb-1 block">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3 text-white/40" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white/70 mb-1 block">Email Address *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                      />
                    </div>
                  </div>

                  {cfg.phone.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">
                        Mobile Number {cfg.phone.required ? '*' : '(Optional)'}
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-3 text-white/40" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {cfg.gender.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1.5 block">
                        Gender {cfg.gender.required ? '*' : '(Optional)'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
                        {['Male', 'Female', 'Non-Binary', 'Prefer Not To Say'].map((g) => {
                          const isSelected = gender === g;
                          return (
                            <motion.button
                              key={g}
                              type="button"
                              onClick={() => setGender(g)}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className={`relative py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer overflow-hidden ${
                                isSelected
                                  ? 'border-[#E873C3] text-white shadow-[0_0_16px_rgba(232,115,195,0.35)]'
                                  : 'bg-white/[0.04] border-white/[0.1] text-white/60 hover:bg-white/[0.08] hover:text-white'
                              }`}
                            >
                              {isSelected && (
                                <motion.div
                                  layoutId="active-pill-gender"
                                  className="absolute inset-0 bg-gradient-to-r from-[#E873C3]/25 to-[#8D37D6]/20"
                                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10">{g}</span>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                  className="relative z-10"
                                >
                                  <CheckCircle2 size={13} className="text-[#E873C3]" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: Academic / Professional */}
              {step === 2 && hasStep2Fields && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex flex-col gap-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap size={16} className="text-[#E873C3]" /> Education & Background
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-white/70 mb-1.5 block">Category</label>
                    <div className="grid grid-cols-2 gap-2 relative">
                      {[
                        { value: 'College Student', label: '🎓 College Student' },
                        { value: 'School Student', label: '🏫 School Student' },
                        { value: 'Working Professional', label: '💼 Working Professional' },
                        { value: 'Fresher / Job Seeker', label: '🚀 Job Seeker' },
                      ].map((cat) => {
                        const isSelected = userType === cat.value;
                        return (
                          <motion.button
                            key={cat.value}
                            type="button"
                            onClick={() => setUserType(cat.value)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className={`relative p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer overflow-hidden ${
                              isSelected
                                ? 'border-[#E873C3] text-white shadow-[0_0_16px_rgba(232,115,195,0.35)]'
                                : 'bg-white/[0.04] border-white/[0.1] text-white/60 hover:bg-white/[0.08] hover:text-white'
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="active-pill-[#E873C3]-usertype"
                                className="absolute inset-0 bg-gradient-to-r from-[#E873C3]/25 to-[#8D37D6]/20"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                              />
                            )}
                            <span className="truncate relative z-10">{cat.label}</span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                className="relative z-10 shrink-0"
                              >
                                <CheckCircle2 size={14} className="text-[#E873C3]" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {cfg.college_org.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">
                        College / Organization Name {cfg.college_org.required ? '*' : '(Optional)'}
                      </label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3.5 top-3 text-white/40" />
                        <input
                          type="text"
                          value={collegeOrg}
                          onChange={(e) => setCollegeOrg(e.target.value)}
                          placeholder="Institute / Company name"
                          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {(cfg.degree.enabled || cfg.year_of_study.enabled) && (
                    <div className="grid grid-cols-2 gap-3">
                      {cfg.degree.enabled && (
                        <div>
                          <label className="text-xs font-bold text-white/70 mb-1 block">
                            Degree {cfg.degree.required ? '*' : '(Optional)'}
                          </label>
                          <input
                            type="text"
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            placeholder="e.g. B.Tech / B.Sc"
                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                          />
                        </div>
                      )}

                      {cfg.year_of_study.enabled && (
                        <div>
                          <label className="text-xs font-bold text-white/70 mb-1.5 block">
                            Year of Study {cfg.year_of_study.required ? '*' : '(Optional)'}
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 relative">
                            {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Graduated'].map((y) => {
                              const isSelected = yearOfStudy === y;
                              return (
                                <motion.button
                                  key={y}
                                  type="button"
                                  onClick={() => setYearOfStudy(y)}
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{ duration: 0.15, ease: 'easeOut' }}
                                  className={`relative py-2 px-1.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer overflow-hidden ${
                                    isSelected
                                      ? 'border-[#E873C3] text-white shadow-[0_0_15px_rgba(232,115,195,0.3)]'
                                      : 'bg-white/[0.04] border-white/[0.1] text-white/60 hover:bg-white/[0.08] hover:text-white'
                                  }`}
                                >
                                  {isSelected && (
                                    <motion.div
                                      layoutId="active-pill-year"
                                      className="absolute inset-0 bg-gradient-to-r from-[#E873C3]/25 to-[#8D37D6]/20"
                                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                  )}
                                  <span className="relative z-10">{y.replace(' Year', '')}</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {cfg.branch.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">
                        Branch / Specialization {cfg.branch.required ? '*' : '(Optional)'}
                      </label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="e.g. Computer Science, AI, Electronics"
                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                      />
                    </div>
                  )}

                  {cfg.city_state.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">
                        City & State {cfg.city_state.required ? '*' : '(Optional)'}
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-3 text-white/40" />
                        <input
                          type="text"
                          value={cityState}
                          onChange={(e) => setCityState(e.target.value)}
                          placeholder="e.g. New Delhi, Delhi"
                          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 3: Profiles & Handles */}
              {step === 3 && hasStep3Fields && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex flex-col gap-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Github size={16} className="text-[#E873C3]" /> Profiles & Handles
                  </h3>

                  {cfg.github_url.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">
                        GitHub Profile {cfg.github_url.required ? '*' : '(Optional)'}
                      </label>
                      <div className="relative">
                        <Github size={16} className="absolute left-3.5 top-3 text-white/40" />
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/yourusername"
                          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {cfg.linkedin_url.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">
                        LinkedIn Profile {cfg.linkedin_url.required ? '*' : '(Optional)'}
                      </label>
                      <div className="relative">
                        <Linkedin size={16} className="absolute left-3.5 top-3 text-white/40" />
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/yourusername"
                          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {cfg.portfolio_url.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">
                        Portfolio Website {cfg.portfolio_url.required ? '*' : '(Optional)'}
                      </label>
                      <div className="relative">
                        <Globe size={16} className="absolute left-3.5 top-3 text-white/40" />
                        <input
                          type="url"
                          value={portfolioUrl}
                          onChange={(e) => setPortfolioUrl(e.target.value)}
                          placeholder="https://yourportfolio.com"
                          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {cfg.resume_url.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">
                        Resume Drive Link {cfg.resume_url.required ? '*' : '(Optional)'}
                      </label>
                      <div className="relative">
                        <Globe size={16} className="absolute left-3.5 top-3 text-white/40" />
                        <input
                          type="url"
                          value={resumeUrl}
                          onChange={(e) => setResumeUrl(e.target.value)}
                          placeholder="https://drive.google.com/file/d/..."
                          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {cfg.coding_handle.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">
                        Coding Handle (Codeforces / LeetCode) {cfg.coding_handle.required ? '*' : '(Optional)'}
                      </label>
                      <div className="relative">
                        <Code size={16} className="absolute left-3.5 top-3 text-white/40" />
                        <input
                          type="text"
                          value={codingHandle}
                          onChange={(e) => setCodingHandle(e.target.value)}
                          placeholder="e.g. tourist / leet_coder"
                          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {cfg.preferred_language.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1.5 block">
                        Preferred Primary Language {cfg.preferred_language.required ? '*' : '(Optional)'}
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 relative">
                        {['C++', 'Python', 'Java', 'JavaScript', 'Go', 'Rust'].map((lang) => {
                          const isSelected = preferredLanguage === lang;
                          return (
                            <motion.button
                              key={lang}
                              type="button"
                              onClick={() => setPreferredLanguage(lang)}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.94 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className={`relative py-2 px-1.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer overflow-hidden ${
                                isSelected
                                  ? 'border-[#E873C3] text-white shadow-[0_0_15px_rgba(232,115,195,0.3)]'
                                  : 'bg-white/[0.04] border-white/[0.1] text-white/60 hover:bg-white/[0.08] hover:text-white'
                              }`}
                            >
                              {isSelected && (
                                <motion.div
                                  layoutId="active-pill-lang"
                                  className="absolute inset-0 bg-gradient-to-r from-[#E873C3]/25 to-[#8D37D6]/20"
                                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10">{lang}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {cfg.referral_source.enabled && (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1.5 block">
                        How did you hear about this event? {cfg.referral_source.required ? '*' : '(Optional)'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 relative">
                        {['CosmoDex Platform', 'College Club / Society', 'LinkedIn / Social Media', 'Friends / Classmates', 'Other'].map((ref) => {
                          const isSelected = referralSource === ref;
                          return (
                            <motion.button
                              key={ref}
                              type="button"
                              onClick={() => setReferralSource(ref)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.96 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className={`relative py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer truncate overflow-hidden ${
                                isSelected
                                  ? 'border-[#E873C3] text-white shadow-[0_0_15px_rgba(232,115,195,0.3)]'
                                  : 'bg-white/[0.04] border-white/[0.1] text-white/60 hover:bg-white/[0.08] hover:text-white'
                              }`}
                            >
                              {isSelected && (
                                <motion.div
                                  layoutId="active-pill-ref"
                                  className="absolute inset-0 bg-gradient-to-r from-[#E873C3]/25 to-[#8D37D6]/20"
                                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10">{ref}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 4: Team Setup (If Team Event) */}
              {step === 4 && isTeamEvent && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex flex-col gap-4"
                >
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} className="text-[#E873C3]" /> Team Setup
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTeamAction('create')}
                      className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        teamAction === 'create'
                          ? 'bg-[#E873C3]/15 border-[#E873C3] text-white'
                          : 'bg-white/[0.03] border-white/[0.1] text-white/50 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="text-xs font-bold">Create New Team</span>
                      <span className="text-[11px] text-white/60">Generate a unique invite code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTeamAction('join')}
                      className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        teamAction === 'join'
                          ? 'bg-[#E873C3]/15 border-[#E873C3] text-white'
                          : 'bg-white/[0.03] border-white/[0.1] text-white/50 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="text-xs font-bold">Join Existing Team</span>
                      <span className="text-[11px] text-white/60">Enter leader&apos;s code</span>
                    </button>
                  </div>

                  {teamAction === 'create' ? (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">Team Name *</label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Enter your cool team name"
                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E873C3] transition-colors"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-white/70 mb-1 block">Team Invite Code *</label>
                      <input
                        type="text"
                        value={teamCode}
                        onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                        placeholder="e.g. TM-8X92K"
                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-2.5 px-4 text-sm font-mono text-white placeholder:text-white/30 uppercase tracking-wider focus:outline-none focus:border-[#E873C3] transition-colors"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modal Controls Footer */}
          <div className="p-6 border-t border-white/[0.06] bg-black/40 flex items-center justify-between shrink-0">
            {currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 bg-white/[0.06] hover:bg-white/[0.12] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStepIndex < totalSteps - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#E873C3] to-[#8D37D6] hover:opacity-90 shadow-lg shadow-[#E873C3]/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitFinal}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-black bg-[#3DCB7F] hover:bg-[#32b870] shadow-lg shadow-[#3DCB7F]/25 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>Registering...</>
                ) : (
                  <>Complete Registration <CheckCircle2 size={14} /></>
                )}
              </button>
            )}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
