'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, RubricRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2, Plus, X, Upload, FileText } from 'lucide-react';

interface FormData {
  topic: string;
  faculty: string;
  career: string;
  semester: string;
  objectives: { value: string }[];
  criteria: { value: string }[];
}

type InputMode = 'form' | 'file';

const FACULTY_OPTIONS = [
  { value: 'ingenieria', label: 'Ingeniería' },
  { value: 'ciencias', label: 'Ciencias' },
  { value: 'humanidades', label: 'Humanidades y Letras' },
  { value: 'salud', label: 'Ciencias de la Salud' },
  { value: 'economia', label: 'Economía y Negocios' },
  { value: 'derecho', label: 'Derecho' },
  { value: 'educacion', label: 'Educación' },
  { value: 'arte', label: 'Arte y Diseño' },
];

const CAREER_OPTIONS: Record<string, { value: string; label: string }[]> = {
  ingenieria: [
    { value: 'sistemas', label: 'Ingeniería en Sistemas' },
    { value: 'civil', label: 'Ingeniería Civil' },
    { value: 'industrial', label: 'Ingeniería Industrial' },
    { value: 'electronica', label: 'Ingeniería Electrónica' },
    { value: 'mecanica', label: 'Ingeniería Mecánica' },
    { value: 'quimica', label: 'Ingeniería Química' },
  ],
  ciencias: [
    { value: 'matematicas', label: 'Matemáticas' },
    { value: 'fisica', label: 'Física' },
    { value: 'quimica', label: 'Química' },
    { value: 'biologia', label: 'Biología' },
    { value: 'computacion', label: 'Ciencias de la Computación' },
  ],
  humanidades: [
    { value: 'historia', label: 'Historia' },
    { value: 'filosofia', label: 'Filosofía' },
    { value: 'literatura', label: 'Literatura' },
    { value: 'psicologia', label: 'Psicología' },
    { value: 'sociologia', label: 'Sociología' },
  ],
  salud: [
    { value: 'medicina', label: 'Medicina' },
    { value: 'enfermeria', label: 'Enfermería' },
    { value: 'odontologia', label: 'Odontología' },
    { value: 'nutricion', label: 'Nutrición' },
    { value: 'fisioterapia', label: 'Fisioterapia' },
  ],
  economia: [
    { value: 'administracion', label: 'Administración de Empresas' },
    { value: 'contaduria', label: 'Contaduría' },
    { value: 'economia', label: 'Economía' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'finanzas', label: 'Finanzas' },
  ],
  derecho: [
    { value: 'derecho', label: 'Derecho' },
    { value: 'criminologia', label: 'Criminología' },
    { value: 'relaciones_internacionales', label: 'Relaciones Internacionales' },
  ],
  educacion: [
    { value: 'pedagogia', label: 'Pedagogía' },
    { value: 'educacion_inicial', label: 'Educación Inicial' },
    { value: 'educacion_especial', label: 'Educación Especial' },
  ],
  arte: [
    { value: 'diseno_grafico', label: 'Diseño Gráfico' },
    { value: 'arquitectura', label: 'Arquitectura' },
    { value: 'artes_visuales', label: 'Artes Visuales' },
    { value: 'musica', label: 'Música' },
  ],
};

const SEMESTER_OPTIONS = [
  { value: '1', label: '1er Semestre' },
  { value: '2', label: '2do Semestre' },
  { value: '3', label: '3er Semestre' },
  { value: '4', label: '4to Semestre' },
  { value: '5', label: '5to Semestre' },
  { value: '6', label: '6to Semestre' },
  { value: '7', label: '7mo Semestre' },
  { value: '8', label: '8vo Semestre' },
  { value: '9', label: '9no Semestre' },
  { value: '10', label: '10mo Semestre' },
];

export default function CreateRubricPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiProvider, setAiProvider] = useState<AIProvider>(AIProvider.OLLAMA);
  const [modelName, setModelName] = useState('qwen3:4b');
  const [selectedFaculty, setSelectedFaculty] = useState('ingenieria');
  const [inputMode, setInputMode] = useState<InputMode>('form');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      faculty: 'ingenieria',
      career: 'sistemas',
      semester: '3',
      objectives: [{ value: '' }],
      criteria: [{ value: '' }],
    },
  });

  const watchedFaculty = watch('faculty');

  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control,
    name: 'objectives',
  });

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control,
    name: 'criteria',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Actualizar carrera cuando cambia la facultad
  useEffect(() => {
    if (watchedFaculty && watchedFaculty !== selectedFaculty) {
      setSelectedFaculty(watchedFaculty);
      // Establecer la primera carrera de la facultad seleccionada
      const firstCareer = CAREER_OPTIONS[watchedFaculty]?.[0]?.value || '';
      setValue('career', firstCareer);
    }
  }, [watchedFaculty, selectedFaculty, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');

      let activity;

      if (inputMode === 'file') {
        // Validar que se haya seleccionado un archivo
        if (!uploadedFile) {
          throw new Error('Por favor selecciona un archivo PDF o Word');
        }

        // Crear FormData para enviar archivo
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('topic', data.topic);
        formData.append('faculty', data.faculty);
        formData.append('career', data.career);
        formData.append('semester', data.semester);
        formData.append('ai_provider', aiProvider);
        if (modelName) {
          formData.append('model_name', modelName);
        }

        activity = await contentAPI.generateRubricFromFile(formData);
      } else {
        // Modo formulario normal
        const objectives = data.objectives.map(obj => obj.value.trim()).filter(obj => obj.length > 0);
        const criteria = data.criteria.map(crit => crit.value.trim()).filter(crit => crit.length > 0);

        if (objectives.length === 0 || criteria.length === 0) {
          setError('Debes agregar al menos un objetivo y un criterio');
          setLoading(false);
          return;
        }

        const request: RubricRequest = {
          topic: data.topic,
          faculty: data.faculty,
          career: data.career,
          semester: data.semester,
          objectives,
          criteria,
          ai_provider: aiProvider,
          model_name: modelName,
        };

        activity = await contentAPI.generateRubric(request);
      }

      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error al generar la rúbrica');
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea PDF o Word
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!validExtensions.includes(fileExtension)) {
        setError('Por favor selecciona un archivo PDF o Word válido (.pdf, .doc, .docx)');
        setUploadedFile(null);
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('El archivo no debe superar los 10MB');
        setUploadedFile(null);
        return;
      }

      setUploadedFile(file);
      setError('');
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Rúbrica de Evaluación"
      description="Genera rúbricas detalladas con criterios y niveles de desempeño"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Selector de modo de entrada */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Método de entrada
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setInputMode('form');
                  setUploadedFile(null);
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  inputMode === 'form'
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-semibold">Formulario Completo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('file');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  inputMode === 'file'
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-semibold">Subir PDF/Word</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Tema/Actividad *
            </label>
            <input
              {...register('topic', { required: 'El tema es requerido' })}
              type="text"
              className="input"
              placeholder="Ej: Proyecto Final, Exposición, Trabajo de Investigación..."
              autoFocus
            />
            {errors.topic && (
              <p className="text-red-600 text-sm mt-1">{errors.topic.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Facultad *
              </label>
              <select
                {...register('faculty', { required: 'La facultad es requerida' })}
                className="input"
              >
                {FACULTY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.faculty && (
                <p className="text-red-600 text-sm mt-1">{errors.faculty.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Carrera *
              </label>
              <select
                {...register('career', { required: 'La carrera es requerida' })}
                className="input"
              >
                {(CAREER_OPTIONS[selectedFaculty] || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.career && (
                <p className="text-red-600 text-sm mt-1">{errors.career.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Semestre *
              </label>
              <select
                {...register('semester', { required: 'El semestre es requerido' })}
                className="input"
              >
                {SEMESTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <p className="text-red-600 text-sm mt-1">{errors.semester.message}</p>
              )}
            </div>
          </div>

          {/* Campo de archivo solo en modo file */}
          {inputMode === 'file' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Archivo PDF o Word <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="rubric-file-upload"
                />
                <label
                  htmlFor="rubric-file-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                    <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setUploadedFile(null);
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      >
                        Eliminar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Haz clic para seleccionar o arrastra un archivo aquí
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF o Word (máximo 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Sube una rúbrica existente en PDF o Word. La IA la analizará y generará una rúbrica estructurada basada en el contenido.
              </p>
            </div>
          )}

          {/* Objetivos y Criterios solo en modo formulario */}
          {inputMode === 'form' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Objetivos de Aprendizaje
                </label>
            <div className="space-y-2">
              {objectiveFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`objectives.${index}.value` as const)}
                    type="text"
                    className="input flex-1"
                    placeholder={`Objetivo ${index + 1}`}
                  />
                  {objectiveFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="btn bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 px-3"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => appendObjective({ value: '' })}
              className="btn btn-secondary mt-2 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar Objetivo
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Criterios de Evaluación
            </label>
            <div className="space-y-2">
              {criteriaFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`criteria.${index}.value` as const)}
                    type="text"
                    className="input flex-1"
                    placeholder={`Criterio ${index + 1} (Ej: Contenido, Presentación, Creatividad)`}
                  />
                  {criteriaFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriteria(index)}
                      className="btn bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 px-3"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => appendCriteria({ value: '' })}
              className="btn btn-secondary mt-2 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar Criterio
            </button>
          </div>
            </>
          )}

          <AIProviderSelector
            value={aiProvider}
            onChange={setAiProvider}
            modelName={modelName}
            onModelChange={setModelName}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Generando Rúbrica...
                </span>
              ) : (
                'Generar Rúbrica con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
