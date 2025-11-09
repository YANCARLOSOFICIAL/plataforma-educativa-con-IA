export enum UserRole {
  ADMIN = 'admin',
  DOCENTE = 'docente',
  ESTUDIANTE = 'estudiante',
}

export enum ActivityType {
  EXAM = 'exam',
  SUMMARY = 'summary',
  CLASS_ACTIVITY = 'class_activity',
  RUBRIC = 'rubric',
  WRITING_CORRECTION = 'writing_correction',
  SLIDES = 'slides',
  EMAIL = 'email',
  SURVEY = 'survey',
  CHATBOT = 'chatbot',
  STORY = 'story',
  CROSSWORD = 'crossword',
  WORD_SEARCH = 'word_search',
}

export enum AIProvider {
  OLLAMA = 'ollama',
  OPENAI = 'openai',
  GEMINI = 'gemini',
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  credits: number;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  role?: UserRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  activity_type: ActivityType;
  content: any;
  subject?: string;
  grade_level?: string;
  is_public: boolean;
  ai_provider?: AIProvider;
  model_used?: string;
  credits_used: number;
  creator_id: number;
  created_at: string;
  updated_at?: string;
}

export interface ExamRequest {
  topic: string;
  num_questions: number;
  question_types: string[];
  grade_level?: string;
  ai_provider: AIProvider;
  model_name?: string;
}

export interface SummaryRequest {
  text: string;
  length: 'short' | 'medium' | 'long';
  ai_provider: AIProvider;
  model_name?: string;
}

export interface ClassActivityRequest {
  topic: string;
  duration_minutes: number;
  grade_level: string;
  objectives: string[];
  ai_provider: AIProvider;
  model_name?: string;
}

export interface RubricRequest {
  topic: string;
  career: string;
  semester: string;
  objectives: string[];
  criteria: string[];
  ai_provider: AIProvider;
  model_name?: string;
}

export interface WritingCorrectionRequest {
  text: string;
  ai_provider: AIProvider;
  model_name?: string;
}

export interface SlidesRequest {
  topic: string;
  num_slides: number;
  grade_level?: string;
  ai_provider: AIProvider;
  model_name?: string;
}

export interface EmailRequest {
  purpose: string;
  recipient_type: string;
  tone: string;
  ai_provider: AIProvider;
  model_name?: string;
}

export interface SurveyRequest {
  topic: string;
  num_questions: number;
  question_types: string[];
  ai_provider: AIProvider;
  model_name?: string;
}

export interface StoryRequest {
  theme: string;
  story_type: 'cuento' | 'fabula' | 'aventura';
  characters: string[];
  moral?: string;
  ai_provider: AIProvider;
  model_name?: string;
}

export interface CrosswordRequest {
  topic: string;
  num_words: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ai_provider: AIProvider;
  model_name?: string;
}

export interface WordSearchRequest {
  topic: string;
  num_words: number;
  grid_size: number;
  ai_provider: AIProvider;
  model_name?: string;
}

// Admin types
export interface DashboardStats {
  total_users: number;
  total_activities: number;
  total_credits_used: number;
  active_users_today: number;
  activities_created_today: number;
}

export interface UserListItem {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  credits: number;
  created_at: string;
}

export interface CreditTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export interface ActivityListItem {
  id: number;
  title: string;
  activity_type: string;
  creator_id: number;
  is_public: boolean;
  credits_used: number;
  created_at: string;
}

export interface UserDetail extends UserListItem {
  recent_activities: ActivityListItem[];
  recent_transactions: CreditTransaction[];
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
  credits?: number;
}

export interface CreditAdjustment {
  amount: number;
  description: string;
}
