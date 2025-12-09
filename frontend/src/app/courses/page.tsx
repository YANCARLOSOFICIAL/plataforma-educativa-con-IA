'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { GraduationCap, Plus, Users, FileText, BookOpen, Building } from 'lucide-react';
import { Button, Card, Badge, Input } from '@/components/ui';
import DashboardLayout from '@/components/DashboardLayout';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';
import { toast } from 'sonner';

interface Course {
  id: number;
  title: string;
  description: string;
  code: string;
  subject: string;
  grade_level: string;
  is_active: boolean;
  student_count: number;
  activity_count: number;
  created_at: string;
}

export default function CoursesPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch('http://localhost:8000/api/courses/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const courseData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      subject: formData.get('subject') as string,
      grade_level: formData.get('grade_level') as string,
    };

    const toastId = toast.loading('Creando curso...');
    try {
      const token = useAuthStore.getState().token;

      // Debug: verificar rol del usuario
      console.log('Usuario actual:', user);
      console.log('Rol del usuario:', user?.role);

      const response = await fetch('http://localhost:8000/api/courses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchCourses();
        (e.target as HTMLFormElement).reset();
        toast.success('Curso creado exitosamente', { id: toastId });
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);

        // Mensaje más descriptivo
        if (response.status === 403) {
          toast.error(`Acceso denegado: ${errorData.detail}. Tu rol es: ${user?.role}`, { id: toastId });
        } else {
          toast.error(errorData.detail || 'Error al crear el curso', { id: toastId });
        }
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Error al crear el curso', { id: toastId });
    }
  };

  const handleJoinByCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!courseCode.trim()) {
      toast.error('Por favor ingresa un código de curso');
      return;
    }

    const toastId = toast.loading('Uniéndote al curso...');
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`http://localhost:8000/api/courses/join-by-code?course_code=${courseCode.trim()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShowJoinModal(false);
        setCourseCode('');
        fetchCourses();
        toast.success(`Te has unido a ${data.title}`, { id: toastId });
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Error al unirse al curso', { id: toastId });
      }
    } catch (error) {
      console.error('Error joining course:', error);
      toast.error('Error al unirse al curso', { id: toastId });
    }
  };

  const isTeacher = user?.role === 'docente' || user?.role === 'admin';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl shadow-lg">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-primary-400 dark:via-blue-400 dark:to-purple-400">
                    Mis Cursos
                  </h1>
                  {courses.length > 0 && (
                    <Badge className="!bg-gradient-to-r !from-primary-600 !to-blue-600 !text-white shadow-lg">
                      {courses.length}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg ml-14">
                  {isTeacher ? 'Gestiona tus cursos y estudiantes' : 'Tus cursos inscritos'}
                </p>
              </div>
              <div className="flex gap-3">
                {!isTeacher && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setShowJoinModal(true)}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Unirse con Código
                  </Button>
                )}
                {isTeacher && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Curso
                  </Button>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <FadeIn delay={0.2}>
              <Card variant="glass" padding="xl" className="text-center">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/20 dark:to-blue-900/20 rounded-3xl mb-6">
                    <GraduationCap className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {isTeacher ? 'No tienes cursos creados' : 'No estás inscrito en ningún curso'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {isTeacher
                      ? 'Comienza creando tu primer curso para organizar tus actividades y estudiantes'
                      : 'Cuando un docente te invite a un curso, aparecerá aquí'
                    }
                  </p>
                  {isTeacher ? (
                    <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
                      <Plus className="w-5 h-5 mr-2" />
                      Crear Primer Curso
                    </Button>
                  ) : (
                    <Button variant="primary" size="lg" onClick={() => setShowJoinModal(true)}>
                      <Plus className="w-5 h-5 mr-2" />
                      Unirse con Código
                    </Button>
                  )}
                </div>
              </Card>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <SlideIn key={course.id} delay={0.1 + index * 0.05} direction="up">
                  <Link href={`/courses/${course.id}`}>
                    <Card
                      variant="glass"
                      padding="lg"
                      className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {course.title}
                        </h3>
                        <Badge variant={course.is_active ? 'success' : 'secondary'}>
                          {course.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                        {course.description || 'Sin descripción'}
                      </p>

                      {(course.subject || course.grade_level) && (
                        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                          {course.subject && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                              <BookOpen className="w-4 h-4" />
                              <span className="font-medium">{course.subject}</span>
                            </div>
                          )}
                          {course.grade_level && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg">
                              <Building className="w-4 h-4" />
                              <span className="font-medium">{course.grade_level}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{course.student_count}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">{course.activity_count}</span>
                          </div>
                        </div>
                        {isTeacher && (
                          <div
                            className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              navigator.clipboard.writeText(course.code);
                              toast.success('Código copiado');
                            }}
                          >
                            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                              Código del curso
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-primary-700 dark:text-primary-300">
                                {course.code}
                              </span>
                              <Plus className="w-3 h-3 text-primary-600 dark:text-primary-400 rotate-45" />
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                </SlideIn>
              ))}
            </div>
          )}
        </div>
      </PageTransition>

      {/* Modal de Crear Curso */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Crear Nuevo Curso
            </h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título del Curso *
                </label>
                <Input
                  type="text"
                  name="title"
                  required
                  placeholder="Ej: Matemáticas Avanzadas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Describe el curso..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Materia
                </label>
                <Input
                  type="text"
                  name="subject"
                  placeholder="Ej: Matemáticas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel/Semestre
                </label>
                <Input
                  type="text"
                  name="grade_level"
                  placeholder="Ej: 5to Semestre"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  Crear Curso
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Unirse con Código */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Unirse a un Curso
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ingresa el código del curso que te proporcionó tu docente
            </p>
            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código del Curso
                </label>
                <Input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  placeholder="Ej: A7B3C9D2"
                  required
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={8}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  El código tiene 8 caracteres
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowJoinModal(false);
                    setCourseCode('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  Unirse al Curso
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
