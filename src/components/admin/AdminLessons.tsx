import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit2, Trash2, GripVertical, Video, Link as LinkIcon, Save, X, Loader2, BookOpen, Map, CheckSquare, Square } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_id: string;
  duration: string;
  tool_link: string;
  created_at: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  created_at: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  created_at: string;
  modules: Module[];
}

interface Trail {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  created_at: string;
  trail_lessons?: TrailLesson[];
}

interface TrailLesson {
  id: string;
  trail_id: string;
  lesson_id: string;
  order_index: number;
  lesson?: Lesson;
}

export function AdminLessons() {
  const [activeTab, setActiveTab] = useState<'courses' | 'trails'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Editing states
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<Partial<Course>>({});
  
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitleInput, setModuleTitleInput] = useState("");
  
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({});
  const [lessonTrailsForm, setLessonTrailsForm] = useState<string[]>([]);
  const [activeModuleForNewLesson, setActiveModuleForNewLesson] = useState<string | null>(null);

  const [editingTrailId, setEditingTrailId] = useState<string | null>(null);
  const [trailForm, setTrailForm] = useState<Partial<Trail>>({});
  const [managingLessonsForTrail, setManagingLessonsForTrail] = useState<string | null>(null);

  // Deletion modals state
  const [itemToDelete, setItemToDelete] = useState<{type: 'course'|'module'|'lesson'|'trail', id: string, parentId?: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Courses -> Modules -> Lessons
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*, modules(*, lessons(*))')
        .order('created_at', { ascending: true });
      
      if (coursesError) throw coursesError;

      let lessonsList: Lesson[] = [];
      if (coursesData) {
        coursesData.forEach(c => {
          if (c.modules) {
            c.modules.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            c.modules.forEach((m: any) => {
              if (m.lessons) {
                m.lessons.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                lessonsList = [...lessonsList, ...m.lessons];
              }
            });
          }
        });
        setCourses(coursesData);
        setAllLessons(lessonsList);
      }

      // Fetch Trails
      const { data: trailsData, error: trailsError } = await supabase
        .from('trails')
        .select('*, trail_lessons(*, lesson:lessons(*))')
        .order('created_at', { ascending: true });
        
      if (trailsError) throw trailsError;
      
      if (trailsData) {
        trailsData.forEach(t => {
          t.trail_lessons?.sort((a: any, b: any) => a.order_index - b.order_index);
        });
        setTrails(trailsData);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(`Erro ao carregar dados. Detalhes do erro: ${err.message || JSON.stringify(err)} \n\nVocê executou a migração SQL no Supabase para criar as tabelas 'courses' e 'trails'?`);
    } finally {
      setLoading(false);
    }
  };

  // --- Course Actions ---
  const handleAddCourse = async () => {
    const { data, error } = await supabase.from('courses').insert({ title: "Novo Curso", description: "" }).select().single();
    if (data) {
      setCourses([...courses, { ...data, modules: [] }]);
      setEditingCourseId(data.id);
      setCourseForm(data);
    }
  };

  const handleSaveCourse = async () => {
    if (!editingCourseId) return;
    const { data, error } = await supabase.from('courses').update({ 
      title: courseForm.title,
      description: courseForm.description,
      thumbnail_url: courseForm.thumbnail_url
    }).eq('id', editingCourseId).select().single();
    
    if (data) {
      setCourses(courses.map(c => c.id === editingCourseId ? { ...c, ...data } : c));
    }
    setEditingCourseId(null);
  };

  // --- Module Actions ---
  const handleAddModule = async (courseId: string) => {
    const { data, error } = await supabase.from('modules').insert({ title: "Novo Módulo", course_id: courseId }).select().single();
    if (data) {
      setCourses(courses.map(c => c.id === courseId ? { ...c, modules: [...c.modules, { ...data, lessons: [] }] } : c));
      setEditingModuleId(data.id);
      setModuleTitleInput(data.title);
    }
  };

  const handleSaveModule = async (courseId: string, moduleId: string) => {
    await supabase.from('modules').update({ title: moduleTitleInput }).eq('id', moduleId);
    setCourses(courses.map(c => c.id === courseId ? {
      ...c,
      modules: c.modules?.map(m => m.id === moduleId ? { ...m, title: moduleTitleInput } : m) || []
    } : c));
    setEditingModuleId(null);
  };

  // --- Lesson Actions ---
  const handleAddLesson = (moduleId: string) => {
    setActiveModuleForNewLesson(moduleId);
    setEditingLessonId(`new_${Date.now()}`);
    setLessonForm({
      title: "",
      description: "",
      video_id: "",
      duration: "",
      tool_link: "/app/input"
    });
    setLessonTrailsForm([]);
  };

  const handleEditLesson = (moduleId: string, lesson: Lesson) => {
    setActiveModuleForNewLesson(moduleId);
    setEditingLessonId(lesson.id);
    setLessonForm(lesson);
    const trailsForLesson = trails.filter(t => t.trail_lessons?.some(tl => tl.lesson_id === lesson.id)).map(t => t.id);
    setLessonTrailsForm(trailsForLesson);
  };

  const handleSaveLesson = async (courseId: string) => {
    if (!activeModuleForNewLesson || !editingLessonId) return;
    const isNew = editingLessonId.startsWith('new_');
    
    const lessonData = {
      module_id: activeModuleForNewLesson,
      title: lessonForm.title || "Nova Aula",
      description: lessonForm.description || "",
      video_id: lessonForm.video_id || "",
      duration: lessonForm.duration || "",
      tool_link: lessonForm.tool_link || "/app/input"
    };

    if (isNew) {
      const { data, error } = await supabase.from('lessons').insert(lessonData).select().single();
      if (data) {
        setCourses(courses.map(c => c.id === courseId ? {
          ...c,
          modules: c.modules?.map(m => m.id === activeModuleForNewLesson ? { ...m, lessons: [...(m.lessons || []), data] } : m) || []
        } : c));
        setAllLessons([...allLessons, data]);
        
        // Add to trails
        if (lessonTrailsForm.length > 0) {
          for (const trailId of lessonTrailsForm) {
            const trail = trails.find(t => t.id === trailId);
            const nextOrder = (trail?.trail_lessons?.length || 0) + 1;
            await supabase.from('trail_lessons').insert({
              trail_id: trailId,
              lesson_id: data.id,
              order_index: nextOrder
            });
          }
          fetchData(); // Refetch to update trails state
        }
      }
    } else {
      const { data, error } = await supabase.from('lessons').update(lessonData).eq('id', editingLessonId).select().single();
      if (data) {
        setCourses(courses.map(c => c.id === courseId ? {
          ...c,
          modules: c.modules?.map(m => m.id === activeModuleForNewLesson ? { 
            ...m, 
            lessons: m.lessons?.map(l => l.id === editingLessonId ? data : l) || []
          } : m) || []
        } : c));
        setAllLessons(allLessons.map(l => l.id === editingLessonId ? data : l));
        
        // Sync trails
        const currentTrails = trails.filter(t => t.trail_lessons?.some(tl => tl.lesson_id === editingLessonId)).map(t => t.id);
        const trailsToAdd = lessonTrailsForm.filter(id => !currentTrails.includes(id));
        const trailsToRemove = currentTrails.filter(id => !lessonTrailsForm.includes(id));
        
        for (const trailId of trailsToRemove) {
          await supabase.from('trail_lessons').delete().match({ trail_id: trailId, lesson_id: editingLessonId });
        }
        
        for (const trailId of trailsToAdd) {
          const trail = trails.find(t => t.id === trailId);
          const nextOrder = (trail?.trail_lessons?.length || 0) + 1;
          await supabase.from('trail_lessons').insert({
            trail_id: trailId,
            lesson_id: editingLessonId,
            order_index: nextOrder
          });
        }
        
        if (trailsToAdd.length > 0 || trailsToRemove.length > 0) {
          fetchData(); // Refetch to update trails state
        }
      }
    }

    setEditingLessonId(null);
    setActiveModuleForNewLesson(null);
    setLessonForm({});
    setLessonTrailsForm([]);
  };

  // --- Trail Actions ---
  const handleAddTrail = async () => {
    const { data, error } = await supabase.from('trails').insert({ title: "Nova Trilha", description: "" }).select().single();
    if (data) {
      setTrails([...trails, { ...data, trail_lessons: [] }]);
      setEditingTrailId(data.id);
      setTrailForm(data);
    }
  };

  const handleSaveTrail = async () => {
    if (!editingTrailId) return;
    const { data, error } = await supabase.from('trails').update({ 
      title: trailForm.title,
      description: trailForm.description,
      thumbnail_url: trailForm.thumbnail_url
    }).eq('id', editingTrailId).select().single();
    
    if (data) {
      setTrails(trails.map(t => t.id === editingTrailId ? { ...t, ...data } : t));
    }
    setEditingTrailId(null);
  };

  const toggleLessonInTrail = async (trailId: string, lessonId: string, isCurrentlyInTrail: boolean) => {
    const trail = trails.find(t => t.id === trailId);
    if (!trail) return;

    if (isCurrentlyInTrail) {
      // Remove
      await supabase.from('trail_lessons').delete().match({ trail_id: trailId, lesson_id: lessonId });
      setTrails(trails.map(t => t.id === trailId ? {
        ...t,
        trail_lessons: t.trail_lessons?.filter(tl => tl.lesson_id !== lessonId)
      } : t));
    } else {
      // Add
      const nextOrder = (trail.trail_lessons?.length || 0) + 1;
      const { data } = await supabase.from('trail_lessons').insert({
        trail_id: trailId,
        lesson_id: lessonId,
        order_index: nextOrder
      }).select('*, lesson:lessons(*)').single();
      
      if (data) {
        setTrails(trails.map(t => t.id === trailId ? {
          ...t,
          trail_lessons: [...(t.trail_lessons || []), data]
        } : t));
      }
    }
  };

  // --- Deletion ---
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, id, parentId } = itemToDelete;
    
    try {
      if (type === 'course') {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;
        setCourses(courses.filter(c => c.id !== id));
      } else if (type === 'module') {
        const { error } = await supabase.from('modules').delete().eq('id', id);
        if (error) throw error;
        setCourses(courses.map(c => c.id === parentId ? { ...c, modules: c.modules?.filter(m => m.id !== id) || [] } : c));
      } else if (type === 'lesson') {
        // Excluir dependências primeiro para evitar erro de foreign key
        await supabase.from('lesson_comments').delete().eq('lesson_id', id);
        await supabase.from('user_lesson_progress').delete().eq('lesson_id', id);
        await supabase.from('trail_lessons').delete().eq('lesson_id', id);
        
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;
        
        setCourses(courses.map(c => ({
          ...c,
          modules: c.modules?.map(m => m.id === parentId ? { ...m, lessons: m.lessons?.filter(l => l.id !== id) || [] } : m) || []
        })));
        setAllLessons(allLessons.filter(l => l.id !== id));
      } else if (type === 'trail') {
        const { error } = await supabase.from('trails').delete().eq('id', id);
        if (error) throw error;
        setTrails(trails.filter(t => t.id !== id));
      }
    } catch (err: any) {
      console.error("Erro ao excluir item:", err);
      alert(`Erro ao excluir o item. Detalhes: ${err.message || 'Verifique o console.'}`);
    } finally {
      setItemToDelete(null);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-600">
        <h3 className="font-bold mb-2">Erro de Banco de Dados</h3>
        <p>{error}</p>
        <p className="mt-4 text-sm">Execute o script SQL localizado em <code>supabase/migrations/20240330000000_add_courses_and_trails.sql</code> no seu painel do Supabase (SQL Editor).</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Gestão de Conteúdo</h2>
          <p className="text-slate-500 font-medium text-sm">Gerencie os cursos, módulos, aulas e trilhas do SocialImob Academy.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'courses' 
                ? 'bg-white text-brand-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Cursos e Módulos
          </button>
          <button
            onClick={() => setActiveTab('trails')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'trails' 
                ? 'bg-white text-brand-secondary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Map className="w-4 h-4" />
            Trilhas (Jornadas)
          </button>
        </div>
      </div>

      {activeTab === 'courses' && (
        <div className="space-y-8">
          <div className="flex justify-end">
            <Button 
              onClick={handleAddCourse}
              className="bg-brand-primary hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-brand-primary/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Curso
            </Button>
          </div>

          {courses.map(course => (
            <div key={course.id} className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200 space-y-6">
              <div className="flex items-start justify-between">
                {editingCourseId === course.id ? (
                  <div className="flex-1 space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mr-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Título do Curso</label>
                      <Input 
                        value={courseForm.title || ""}
                        onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                        placeholder="Ex: Formação SocialImob"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                      <textarea 
                        value={courseForm.description || ""}
                        onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none min-h-[80px]"
                        placeholder="Descrição do curso..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="ghost" onClick={() => setEditingCourseId(null)}>Cancelar</Button>
                      <Button onClick={handleSaveCourse} className="bg-brand-primary text-white">Salvar Curso</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-brand-primary" />
                      {course.title}
                    </h3>
                    {course.description && <p className="text-slate-500 mt-1">{course.description}</p>}
                  </div>
                )}
                
                {editingCourseId !== course.id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingCourseId(course.id); setCourseForm(course); }} className="text-slate-400 hover:text-brand-primary">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setItemToDelete({type: 'course', id: course.id})} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="pl-0 md:pl-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Módulos do Curso</h4>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddModule(course.id)}
                    className="rounded-xl border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Módulo
                  </Button>
                </div>

                {course.modules.length === 0 && (
                  <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-500 text-sm">Nenhum módulo neste curso.</p>
                  </div>
                )}

                {course.modules.map((module) => (
                  <Card key={module.id} className="bg-white border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                          {editingModuleId === module.id ? (
                            <div className="flex items-center gap-2 flex-1 max-w-md">
                              <Input 
                                value={moduleTitleInput}
                                onChange={(e) => setModuleTitleInput(e.target.value)}
                                className="bg-white border-slate-200 rounded-xl h-8"
                                autoFocus
                              />
                              <Button size="icon" variant="ghost" onClick={() => handleSaveModule(course.id, module.id)} className="h-8 w-8 text-emerald-600 hover:bg-emerald-50">
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingModuleId(null)} className="h-8 w-8 text-slate-400 hover:bg-slate-100">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <CardTitle className="text-base font-bold text-slate-900">{module.title}</CardTitle>
                          )}
                        </div>
                        
                        {editingModuleId !== module.id && (
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => { setEditingModuleId(module.id); setModuleTitleInput(module.title); }} className="h-8 w-8 text-slate-400 hover:text-brand-primary">
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setItemToDelete({type: 'module', id: module.id, parentId: course.id})} className="h-8 w-8 text-slate-400 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-100">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                            {editingLessonId === lesson.id ? (
                              <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Título da Aula</label>
                                    <Input 
                                      value={lessonForm.title || ""}
                                      onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Duração</label>
                                    <Input 
                                      value={lessonForm.duration || ""}
                                      onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                                    <textarea 
                                      value={lessonForm.description || ""}
                                      onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none min-h-[60px]"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Link de Embed (URL)</label>
                                    <div className="relative">
                                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                      <Input 
                                        value={lessonForm.video_id || ""}
                                        onChange={(e) => setLessonForm({...lessonForm, video_id: e.target.value})}
                                        className="pl-8 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Link da Ferramenta</label>
                                    <div className="relative">
                                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                      <Input 
                                        value={lessonForm.tool_link || ""}
                                        onChange={(e) => setLessonForm({...lessonForm, tool_link: e.target.value})}
                                        className="pl-8 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                  {trails.length > 0 && (
                                    <div className="space-y-2 md:col-span-2">
                                      <label className="text-xs font-bold text-slate-500 uppercase">Adicionar às Trilhas</label>
                                      <div className="flex flex-wrap gap-2">
                                        {trails.map(trail => (
                                          <div 
                                            key={trail.id}
                                            onClick={() => {
                                              if (lessonTrailsForm.includes(trail.id)) {
                                                setLessonTrailsForm(lessonTrailsForm.filter(id => id !== trail.id));
                                              } else {
                                                setLessonTrailsForm([...lessonTrailsForm, trail.id]);
                                              }
                                            }}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer border transition-colors ${
                                              lessonTrailsForm.includes(trail.id)
                                                ? 'bg-brand-secondary/10 border-brand-secondary/30 text-brand-secondary'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                          >
                                            {lessonTrailsForm.includes(trail.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                            {trail.title}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                  <Button size="sm" variant="ghost" onClick={() => setEditingLessonId(null)}>Cancelar</Button>
                                  <Button size="sm" onClick={() => handleSaveLesson(course.id)} className="bg-brand-primary text-white">Salvar Aula</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                  <GripVertical className="w-4 h-4 text-slate-300 cursor-grab mt-1" />
                                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                                    <Video className="w-4 h-4 text-brand-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm text-slate-900">{lesson.title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{lesson.duration || '00:00'}</span>
                                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                        <Video className="w-3 h-3" /> {lesson.video_id ? "Vídeo" : "Sem vídeo"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button size="icon" variant="ghost" onClick={() => handleEditLesson(module.id, lesson)} className="h-8 w-8 text-slate-400 hover:text-brand-primary">
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => setItemToDelete({type: 'lesson', id: lesson.id, parentId: module.id})} className="h-8 w-8 text-slate-400 hover:text-red-500">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* New Lesson Form for this module */}
                        {editingLessonId?.startsWith('new_') && activeModuleForNewLesson === module.id && (
                          <div className="p-4 bg-slate-50/50">
                            <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Título da Aula</label>
                                    <Input 
                                      value={lessonForm.title || ""}
                                      onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Duração</label>
                                    <Input 
                                      value={lessonForm.duration || ""}
                                      onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                                    <textarea 
                                      value={lessonForm.description || ""}
                                      onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none min-h-[60px]"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Link de Embed (URL)</label>
                                    <div className="relative">
                                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                      <Input 
                                        value={lessonForm.video_id || ""}
                                        onChange={(e) => setLessonForm({...lessonForm, video_id: e.target.value})}
                                        className="pl-8 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Link da Ferramenta</label>
                                    <div className="relative">
                                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                      <Input 
                                        value={lessonForm.tool_link || ""}
                                        onChange={(e) => setLessonForm({...lessonForm, tool_link: e.target.value})}
                                        className="pl-8 h-9 text-sm"
                                      />
                                    </div>
                                  </div>
                                  {trails.length > 0 && (
                                    <div className="space-y-2 md:col-span-2">
                                      <label className="text-xs font-bold text-slate-500 uppercase">Adicionar às Trilhas</label>
                                      <div className="flex flex-wrap gap-2">
                                        {trails.map(trail => (
                                          <div 
                                            key={trail.id}
                                            onClick={() => {
                                              if (lessonTrailsForm.includes(trail.id)) {
                                                setLessonTrailsForm(lessonTrailsForm.filter(id => id !== trail.id));
                                              } else {
                                                setLessonTrailsForm([...lessonTrailsForm, trail.id]);
                                              }
                                            }}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer border transition-colors ${
                                              lessonTrailsForm.includes(trail.id)
                                                ? 'bg-brand-secondary/10 border-brand-secondary/30 text-brand-secondary'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                          >
                                            {lessonTrailsForm.includes(trail.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                            {trail.title}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                  <Button size="sm" variant="ghost" onClick={() => { setEditingLessonId(null); setActiveModuleForNewLesson(null); }}>Cancelar</Button>
                                  <Button size="sm" onClick={() => handleSaveLesson(course.id)} className="bg-brand-primary text-white">Salvar Aula</Button>
                                </div>
                              </div>
                          </div>
                        )}

                        {/* Add Lesson Button */}
                        {!(editingLessonId?.startsWith('new_') && activeModuleForNewLesson === module.id) && (
                          <div className="p-3 bg-slate-50 flex justify-center">
                            <Button 
                              size="sm"
                              variant="ghost" 
                              onClick={() => handleAddLesson(module.id)}
                              className="text-brand-primary hover:bg-brand-primary/10 rounded-lg w-full max-w-sm border border-dashed border-brand-primary/30"
                            >
                              <Plus className="w-3 h-3 mr-2" />
                              Adicionar Aula
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {courses.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-[2rem]">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Nenhum curso cadastrado</h3>
              <p className="text-slate-500 mt-2">Comece criando o seu primeiro curso.</p>
              <Button 
                onClick={handleAddCourse}
                className="mt-6 bg-brand-primary hover:bg-blue-700 text-white rounded-2xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Curso
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trails' && (
        <div className="space-y-8">
          <div className="flex justify-end">
            <Button 
              onClick={handleAddTrail}
              className="bg-brand-secondary hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-brand-secondary/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Trilha
            </Button>
          </div>

          {trails.map(trail => (
            <div key={trail.id} className="bg-white border-slate-200 rounded-[2rem] shadow-sm overflow-hidden border">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  {editingTrailId === trail.id ? (
                    <div className="flex-1 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm mr-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Título da Trilha</label>
                        <Input 
                          value={trailForm.title || ""}
                          onChange={(e) => setTrailForm({...trailForm, title: e.target.value})}
                          placeholder="Ex: Jornada do Corretor Iniciante"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                        <textarea 
                          value={trailForm.description || ""}
                          onChange={(e) => setTrailForm({...trailForm, description: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none min-h-[80px]"
                          placeholder="Descrição da trilha..."
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setEditingTrailId(null)}>Cancelar</Button>
                        <Button onClick={handleSaveTrail} className="bg-brand-secondary text-white">Salvar Trilha</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Map className="w-5 h-5 text-brand-secondary" />
                        {trail.title}
                      </h3>
                      {trail.description && <p className="text-slate-500 mt-1">{trail.description}</p>}
                    </div>
                  )}
                  
                  {editingTrailId !== trail.id && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingTrailId(trail.id); setTrailForm(trail); }} className="text-slate-400 hover:text-brand-secondary">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setItemToDelete({type: 'trail', id: trail.id})} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-0 bg-slate-50">
                {managingLessonsForTrail === trail.id ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-900">Gerenciar Aulas da Trilha</h4>
                      <Button size="sm" variant="ghost" onClick={() => setManagingLessonsForTrail(null)}>Concluir</Button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                      {allLessons.map(lesson => {
                        const isInTrail = trail.trail_lessons?.some(tl => tl.lesson_id === lesson.id);
                        return (
                          <div 
                            key={lesson.id} 
                            onClick={() => toggleLessonInTrail(trail.id, lesson.id, !!isInTrail)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                              isInTrail 
                                ? 'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {isInTrail ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-300" />}
                            <span className="font-medium text-sm">{lesson.title}</span>
                          </div>
                        );
                      })}
                      {allLessons.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">Nenhuma aula cadastrada nos cursos.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-slate-500 mb-4">
                      Esta trilha possui {trail.trail_lessons?.length || 0} aulas.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setManagingLessonsForTrail(trail.id)}
                      className="rounded-xl border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white"
                    >
                      Gerenciar Aulas
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {trails.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-[2rem]">
              <Map className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Nenhuma trilha cadastrada</h3>
              <p className="text-slate-500 mt-2">Crie jornadas de aprendizado para seus alunos.</p>
              <Button 
                onClick={handleAddTrail}
                className="mt-6 bg-brand-secondary hover:bg-orange-600 text-white rounded-2xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Trilha
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-slate-500 mb-6">
              Tem certeza que deseja excluir este item? 
              {itemToDelete.type === 'course' && ' Todos os módulos e aulas associados também serão excluídos.'}
              {itemToDelete.type === 'module' && ' Todas as aulas associadas também serão excluídas.'}
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setItemToDelete(null)}>Cancelar</Button>
              <Button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white">Excluir</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
