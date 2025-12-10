'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Users, FileText, Mail, Plus, Trash2, Copy,
  BookOpen, Calendar, CheckCircle, XCircle, Clock, MessageSquare, Send
} from 'lucide-react';
import { Button, Card, Badge, Input } from '@/components/ui';
import DashboardLayout from '@/components/DashboardLayout';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';
import { toast } from 'sonner';
import { activityTypeLabels } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';

interface Student {
  id: number;
  email: string;
  username: string;
  full_name: string;
  enrolled_at: string;
}

interface Activity {
  id: number;
  title: string;
  description: string;
  activity_type: string;
  subject: string;
  grade_level: string;
  order: number;
  assigned_at: string;
}

interface Invitation {
  id: number;
  email: string;
  token: string;
  is_accepted: boolean;
  is_expired: boolean;
  created_at: string;
  expires_at: string;
}

interface Chatbot {
  id: number;
  name: string;
  description: string;
  chatbot_type: string;
  is_active: boolean;
  creator_id: number;
}

interface CourseDetail {
  id: number;
  title: string;
  description: string;
  code: string;
  subject: string;
  grade_level: string;
  is_active: boolean;
  student_count: number;
  activity_count: number;
  students: Student[];
  activities: Activity[];
}

type TabType = 'students' | 'activities' | 'invitations' | 'chatbots';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user } = useAuthStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [myActivities, setMyActivities] = useState<any[]>([]);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [myChatbots, setMyChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('activities');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showAddChatbotModal, setShowAddChatbotModal] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);

  const isTeacher = user?.role === 'docente' || user?.role === 'admin';

  useEffect(() => {
    fetchCourseDetail();
    fetchInvitations();
    fetchMyActivities();
    fetchCourseChatbots();
    if (isTeacher) {
      fetchMyChatbots();
    }
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        toast.error('No se pudo cargar el curso');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Error al cargar el curso');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}/invitations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const fetchMyActivities = async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch('http://localhost:8000/api/activities/my/activities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMyActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchCourseChatbots = async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}/chatbots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setChatbots(data);
      }
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    }
  };

  const fetchMyChatbots = async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch('http://localhost:8000/api/chatbots/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMyChatbots(data);
      }
    } catch (error) {
      console.error('Error fetching my chatbots:', error);
    }
  };

  const handleSendInvitations = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emails = (formData.get('emails') as string).split(',').map(e => e.trim()).filter(e => e);

    const toastId = toast.loading('Enviando invitaciones...');
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emails })
      });

      if (response.ok) {
        setShowInviteModal(false);
        fetchInvitations();
        (e.target as HTMLFormElement).reset();
        toast.success('Invitaciones enviadas exitosamente', { id: toastId });
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Error al enviar invitaciones', { id: toastId });
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Error al enviar invitaciones', { id: toastId });
    }
  };

  const handleAddActivity = async (activityId: number) => {
    const toastId = toast.loading('Agregando actividad...');
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}/activities?activity_id=${activityId}&order=0`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setShowAddActivityModal(false);
        fetchCourseDetail();
        toast.success('Actividad agregada al curso', { id: toastId });
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Error al agregar actividad', { id: toastId });
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Error al agregar actividad', { id: toastId });
    }
  };

  const handleRemoveActivity = async (activityId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad del curso?')) return;

    const toastId = toast.loading('Eliminando actividad...');
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}/activities/${activityId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCourseDetail();
        toast.success('Actividad eliminada del curso', { id: toastId });
      } else {
        toast.error('Error al eliminar actividad', { id: toastId });
      }
    } catch (error) {
      console.error('Error removing activity:', error);
      toast.error('Error al eliminar actividad', { id: toastId });
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante del curso?')) return;

    const toastId = toast.loading('Eliminando estudiante...');
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCourseDetail();
        toast.success('Estudiante eliminado del curso', { id: toastId });
      } else {
        toast.error('Error al eliminar estudiante', { id: toastId });
      }
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Error al eliminar estudiante', { id: toastId });
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/join-course?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado al portapapeles');
  };

  const handleAddChatbot = async (chatbotId: number) => {
    const toastId = toast.loading('Agregando chatbot...');
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}/chatbots/${chatbotId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCourseChatbots();
        setShowAddChatbotModal(false);
        toast.success('Chatbot agregado al curso', { id: toastId });
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al agregar chatbot', { id: toastId });
      }
    } catch (error) {
      console.error('Error adding chatbot:', error);
      toast.error('Error al agregar chatbot', { id: toastId });
    }
  };

  const handleRemoveChatbot = async (chatbotId: number) => {
    if (!confirm('¿Estás seguro de eliminar este chatbot del curso?')) return;

    const toastId = toast.loading('Eliminando chatbot...');
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`http://localhost:8000/api/courses/${courseId}/chatbots/${chatbotId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCourseChatbots();
        toast.success('Chatbot eliminado del curso', { id: toastId });
      } else {
        toast.error('Error al eliminar chatbot', { id: toastId });
      }
    } catch (error) {
      console.error('Error removing chatbot:', error);
      toast.error('Error al eliminar chatbot', { id: toastId });
    }
  };

  if (loading || !course) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = isTeacher
    ? [
        { id: 'activities' as TabType, label: 'Actividades', count: course.activity_count, icon: FileText },
        { id: 'students' as TabType, label: 'Estudiantes', count: course.student_count, icon: Users },
        { id: 'chatbots' as TabType, label: 'Chatbots', count: chatbots.length, icon: MessageSquare },
        { id: 'invitations' as TabType, label: 'Invitaciones', count: invitations.length, icon: Mail },
      ]
    : [
        { id: 'activities' as TabType, label: 'Actividades', count: course.activity_count, icon: FileText },
        { id: 'students' as TabType, label: 'Estudiantes', count: course.student_count, icon: Users },
        { id: 'chatbots' as TabType, label: 'Chatbots', count: chatbots.length, icon: MessageSquare },
      ];

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-6">
          {/* Back Button */}
          <FadeIn delay={0.1}>
            <Link href="/courses">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Cursos
              </Button>
            </Link>
          </FadeIn>

          {/* Header */}
          <FadeIn delay={0.15}>
            <Card variant="gradient" padding="lg" className="border-0 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {course.title}
                  </h1>
                  <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">Código:</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{course.code}</span>
                    </div>
                    {course.subject && (
                      <Badge variant="primary">{course.subject}</Badge>
                    )}
                    {course.grade_level && (
                      <Badge variant="secondary">{course.grade_level}</Badge>
                    )}
                  </div>
                </div>
                <Badge variant={course.is_active ? 'success' : 'secondary'} className="text-base px-4 py-2">
                  {course.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </Card>
          </FadeIn>

          {/* Share Course Code - Solo para docentes */}
          {isTeacher && (
            <SlideIn delay={0.18} direction="up">
              <Card variant="glass" padding="lg" className="border-2 border-primary-200 dark:border-primary-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Copy className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Código del Curso
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Comparte este código con tus estudiantes para que puedan unirse al curso
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-6 py-4 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/30 dark:to-blue-900/30 rounded-xl border-2 border-primary-300 dark:border-primary-700">
                      <span className="font-mono font-bold text-3xl text-primary-700 dark:text-primary-300 tracking-wider">
                        {course.code}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        navigator.clipboard.writeText(course.code);
                        toast.success('Código copiado al portapapeles');
                      }}
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </Card>
            </SlideIn>
          )}

          {/* Tabs */}
          <SlideIn delay={0.2} direction="up">
            <Card variant="glass" padding="none" className="overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary-500 to-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <Badge className={activeTab === tab.id ? '!bg-white !text-primary-600' : ''}>
                        {tab.count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </Card>
          </SlideIn>

          {/* Content */}
          <div className="min-h-[400px]">
            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <FadeIn>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isTeacher ? 'Actividades del Curso' : 'Actividades Asignadas'}
                    </h2>
                    {isTeacher && (
                      <Button variant="primary" onClick={() => setShowAddActivityModal(true)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Agregar Actividad
                      </Button>
                    )}
                  </div>

                  {course.activities.length === 0 ? (
                    <Card variant="glass" padding="xl" className="text-center">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No hay actividades
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {isTeacher
                          ? 'Agrega actividades para que los estudiantes puedan verlas'
                          : 'El docente aún no ha asignado actividades a este curso'}
                      </p>
                      {isTeacher && (
                        <Button variant="primary" onClick={() => setShowAddActivityModal(true)}>
                          <Plus className="w-5 h-5 mr-2" />
                          Agregar Primera Actividad
                        </Button>
                      )}
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {course.activities.map((activity, index) => {
                        const ActivityContent = (
                          <Card
                            variant="glass"
                            padding="md"
                            className={`group transition-all ${!isTeacher ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : 'hover:shadow-lg'}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className={`font-bold text-lg ${!isTeacher ? 'text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                                    {activity.title}
                                  </h3>
                                  <Badge variant="primary">
                                    {activityTypeLabels[activity.activity_type as keyof typeof activityTypeLabels]}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                  {activity.description}
                                </p>
                                <div className="flex items-center gap-3 flex-wrap">
                                  {activity.subject && (
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                      {activity.subject}
                                    </span>
                                  )}
                                  {!isTeacher && (
                                    <span className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
                                      {['exam', 'survey', 'crossword', 'word_search'].includes(activity.activity_type)
                                        ? '✏️ Clic para realizar →'
                                        : '👁️ Clic para ver →'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isTeacher && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleRemoveActivity(activity.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </Card>
                        );

                        // Determinar si la actividad es interactiva
                        const isInteractive = ['exam', 'survey', 'crossword', 'word_search'].includes(activity.activity_type);
                        const activityLink = isInteractive
                          ? `/activity/${activity.id}/complete`
                          : `/activity/${activity.id}`;

                        return (
                          <SlideIn key={activity.id} delay={index * 0.05} direction="right">
                            {isTeacher ? (
                              ActivityContent
                            ) : (
                              <Link href={activityLink}>
                                {ActivityContent}
                              </Link>
                            )}
                          </SlideIn>
                        );
                      })}
                    </div>
                  )}
                </div>
              </FadeIn>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <FadeIn>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isTeacher ? 'Estudiantes Inscritos' : 'Compañeros del Curso'}
                    </h2>
                    {isTeacher && (
                      <Button variant="primary" onClick={() => setShowInviteModal(true)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Invitar Estudiantes
                      </Button>
                    )}
                  </div>

                  {course.students.length === 0 ? (
                    <Card variant="glass" padding="xl" className="text-center">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No hay estudiantes inscritos
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {isTeacher
                          ? 'Invita a estudiantes para que se unan a tu curso'
                          : 'Aún no hay otros estudiantes en este curso'}
                      </p>
                      {isTeacher && (
                        <Button variant="primary" onClick={() => setShowInviteModal(true)}>
                          <Plus className="w-5 h-5 mr-2" />
                          Invitar Estudiantes
                        </Button>
                      )}
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {course.students.map((student, index) => (
                        <SlideIn key={student.id} delay={index * 0.05} direction="right">
                          <Card variant="glass" padding="md" className="group hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                  {student.full_name?.[0] || student.username[0]}
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900 dark:text-white">
                                    {student.full_name || student.username}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    Inscrito: {new Date(student.enrolled_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              {isTeacher && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleRemoveStudent(student.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </Card>
                        </SlideIn>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>
            )}

            {/* Invitations Tab */}
            {activeTab === 'invitations' && (
              <FadeIn>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invitaciones Enviadas</h2>
                    <Button variant="primary" onClick={() => setShowInviteModal(true)}>
                      <Plus className="w-5 h-5 mr-2" />
                      Nueva Invitación
                    </Button>
                  </div>

                  {invitations.length === 0 ? (
                    <Card variant="glass" padding="xl" className="text-center">
                      <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No hay invitaciones enviadas
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Envía invitaciones para que los estudiantes se unan
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {invitations.map((invitation, index) => (
                        <SlideIn key={invitation.id} delay={index * 0.05} direction="right">
                          <Card variant="glass" padding="md" className="group hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold text-gray-900 dark:text-white">{invitation.email}</h3>
                                  {invitation.is_accepted ? (
                                    <Badge variant="success">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Aceptada
                                    </Badge>
                                  ) : invitation.is_expired ? (
                                    <Badge variant="danger">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Expirada
                                    </Badge>
                                  ) : (
                                    <Badge variant="warning">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pendiente
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                                  <p>Enviada: {new Date(invitation.created_at).toLocaleDateString()}</p>
                                  <p>Expira: {new Date(invitation.expires_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              {!invitation.is_accepted && !invitation.is_expired && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => copyInvitationLink(invitation.token)}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copiar Link
                                </Button>
                              )}
                            </div>
                          </Card>
                        </SlideIn>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>
            )}

            {/* Chatbots Tab */}
            {activeTab === 'chatbots' && (
              <FadeIn>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isTeacher ? 'Chatbots del Curso' : 'Asistentes Disponibles'}
                    </h2>
                    {isTeacher && (
                      <Button variant="primary" onClick={() => setShowAddChatbotModal(true)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Agregar Chatbot
                      </Button>
                    )}
                  </div>

                  {chatbots.length === 0 ? (
                    <Card variant="glass" padding="xl" className="text-center">
                      <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No hay chatbots asignados
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {isTeacher
                          ? 'Agrega chatbots para que los estudiantes puedan interactuar con ellos'
                          : 'El docente aún no ha asignado chatbots a este curso'}
                      </p>
                      {isTeacher && (
                        <Button variant="primary" onClick={() => setShowAddChatbotModal(true)}>
                          <Plus className="w-5 h-5 mr-2" />
                          Agregar Primer Chatbot
                        </Button>
                      )}
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {chatbots.map((chatbot, index) => (
                        <SlideIn key={chatbot.id} delay={index * 0.05} direction="right">
                          <Card
                            variant="glass"
                            padding="md"
                            className={`group transition-all ${!isTeacher ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : 'hover:shadow-lg'}`}
                            onClick={() => !isTeacher && setSelectedChatbot(chatbot)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                  <h3 className={`font-bold text-lg ${!isTeacher ? 'text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                                    {chatbot.name}
                                  </h3>
                                  <Badge variant="primary">{chatbot.chatbot_type}</Badge>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                  {chatbot.description}
                                </p>
                                {!isTeacher && (
                                  <span className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
                                    💬 Clic para chatear →
                                  </span>
                                )}
                              </div>
                              {isTeacher && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleRemoveChatbot(chatbot.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                              {!isTeacher && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => setSelectedChatbot(chatbot)}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </Card>
                        </SlideIn>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </PageTransition>

      {/* Modal de Invitar Estudiantes */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Invitar Estudiantes
            </h2>
            <form onSubmit={handleSendInvitations} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correos Electrónicos
                </label>
                <textarea
                  name="emails"
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="ejemplo1@email.com, ejemplo2@email.com"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Separa los correos con comas
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  Enviar Invitaciones
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Agregar Actividad */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Agregar Actividad al Curso
            </h2>
            <div className="space-y-3">
              {myActivities.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No tienes actividades creadas
                </p>
              ) : (
                myActivities
                  .filter(act => !course.activities.find(ca => ca.id === act.id))
                  .map((activity) => (
                    <Card key={activity.id} variant="glass" padding="md" className="group hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white">{activity.title}</h3>
                            <Badge variant="primary">
                              {activityTypeLabels[activity.activity_type as keyof typeof activityTypeLabels]}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddActivity(activity.id)}
                        >
                          Agregar
                        </Button>
                      </div>
                    </Card>
                  ))
              )}
            </div>
            <div className="mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowAddActivityModal(false)}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agregar Chatbot */}
      {showAddChatbotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Agregar Chatbot al Curso
            </h2>
            <div className="space-y-3">
              {myChatbots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No tienes chatbots creados
                  </p>
                  <Button variant="primary" onClick={() => router.push('/chatbots')}>
                    Crear Chatbot
                  </Button>
                </div>
              ) : (
                myChatbots
                  .filter(cb => !chatbots.find(c => c.id === cb.id))
                  .map((chatbot) => (
                    <Card key={chatbot.id} variant="glass" padding="md" className="group hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <h3 className="font-bold text-gray-900 dark:text-white">{chatbot.name}</h3>
                            <Badge variant="primary">{chatbot.chatbot_type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{chatbot.description}</p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddChatbot(chatbot.id)}
                        >
                          Agregar
                        </Button>
                      </div>
                    </Card>
                  ))
              )}
            </div>
            <div className="mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowAddChatbotModal(false)}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal/Redirect de Chat con Chatbot */}
      {selectedChatbot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card variant="glass" padding="lg" className="max-w-md w-full shadow-2xl">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedChatbot.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Serás redirigido a la página de chatbots para iniciar la conversación
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedChatbot(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push(`/chatbots?chatId=${selectedChatbot.id}`)}
                  className="flex-1"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Ir a Chat
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
