import { useState, useEffect } from "react";
import { PlayCircle, Star, MessageSquare, ThumbsUp, Send, Loader2, BookOpen, Map, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type ViewState = 'overview' | 'course' | 'trail';

export default function Lessons() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [view, setView] = useState<ViewState>('overview');
  const [courses, setCourses] = useState<any[]>([]);
  const [trails, setTrails] = useState<any[]>([]);
  
  const [activeCourse, setActiveCourse] = useState<any | null>(null);
  const [activeTrail, setActiveTrail] = useState<any | null>(null);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Courses
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*, modules(*, lessons(*))')
      .order('created_at', { ascending: true });
    
    if (coursesData) {
      coursesData.forEach(c => {
        c.modules.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        c.modules.forEach((m: any) => m.lessons.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
      });
      setCourses(coursesData);
    }

    // Fetch Trails
    const { data: trailsData } = await supabase
      .from('trails')
      .select('*, trail_lessons(*, lesson:lessons(*))')
      .order('created_at', { ascending: true });
      
    if (trailsData) {
      trailsData.forEach(t => {
        t.trail_lessons?.sort((a: any, b: any) => a.order_index - b.order_index);
      });
      setTrails(trailsData);
    }

    // Fetch Progress
    if (user) {
      const { data: progressData } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);
        
      if (progressData) {
        const progMap: Record<string, boolean> = {};
        progressData.forEach(p => {
          progMap[p.lesson_id] = p.completed;
        });
        setProgress(progMap);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!activeLesson) return;
    const fetchComments = async () => {
      const { data } = await supabase
        .from('lesson_comments')
        .select('*, profiles(name)')
        .eq('lesson_id', activeLesson.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setComments(data.map(c => ({
          id: c.id,
          user: c.profiles?.name || 'Usuário',
          text: c.text,
          date: new Date(c.created_at).toLocaleDateString('pt-BR')
        })));
      } else {
        setComments([]);
      }
    };
    fetchComments();
    setRating(null);
  }, [activeLesson]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !activeLesson || !user) return;
    
    const { data, error } = await supabase.from('lesson_comments').insert({
      lesson_id: activeLesson.id,
      user_id: user.id,
      text: comment
    }).select('*, profiles(name)').single();

    if (data) {
      setComments([{
        id: data.id,
        user: data.profiles?.name || user.name || "Você",
        text: data.text,
        date: "Agora mesmo"
      }, ...comments]);
      setComment("");
    }
  };

  const toggleLessonProgress = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const isCompleted = !progress[lessonId];
    
    // Optimistic update
    setProgress(prev => ({ ...prev, [lessonId]: isCompleted }));

    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert({ 
        user_id: user.id, 
        lesson_id: lessonId, 
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      }, { onConflict: 'user_id, lesson_id' });

    if (error) {
      console.error("Error updating progress:", error);
      // Revert on error
      setProgress(prev => ({ ...prev, [lessonId]: !isCompleted }));
    }
  };

  const openCourse = (course: any) => {
    setActiveCourse(course);
    setView('course');
    if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      setActiveLesson(course.modules[0].lessons[0]);
    } else {
      setActiveLesson(null);
    }
  };

  const openTrail = (trail: any) => {
    setActiveTrail(trail);
    setView('trail');
    if (trail.trail_lessons && trail.trail_lessons.length > 0 && trail.trail_lessons[0].lesson) {
      setActiveLesson(trail.trail_lessons[0].lesson);
    } else {
      setActiveLesson(null);
    }
  };

  const goBack = () => {
    setView('overview');
    setActiveCourse(null);
    setActiveTrail(null);
    setActiveLesson(null);
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  }

  if (view === 'overview') {
    return (
      <div className="space-y-12">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">SocialImob Academy</h1>
          <p className="text-slate-500 font-medium text-lg">Aulas e estratégias para impulsionar sua carreira</p>
        </div>

        {/* Trails Section */}
        {trails.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-secondary/10 flex items-center justify-center">
                <Map className="w-5 h-5 text-brand-secondary" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Trilhas de Aprendizado</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trails.map(trail => (
                <div 
                  key={trail.id} 
                  onClick={() => openTrail(trail)}
                  className="bg-white border border-slate-200 rounded-[2rem] p-6 cursor-pointer hover:border-brand-secondary/50 hover:shadow-lg hover:shadow-brand-secondary/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-brand-secondary/10 transition-colors">
                    <Map className="w-6 h-6 text-slate-400 group-hover:text-brand-secondary transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-secondary transition-colors">{trail.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{trail.description || "Uma jornada de aprendizado selecionada para você."}</p>
                  <div className="mt-6 flex items-center justify-between text-sm font-bold text-slate-400">
                    <span>{trail.trail_lessons?.length || 0} aulas</span>
                    <span className="text-brand-secondary group-hover:translate-x-1 transition-transform">Começar &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-brand-primary" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Cursos Disponíveis</h2>
          </div>
          
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-[2rem]">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">Nenhum curso disponível</h3>
              <p className="text-slate-500 mt-2">O conteúdo está sendo preparado e em breve estará disponível aqui.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                const totalLessons = course.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0);
                const completedLessons = course.modules.reduce((acc: number, m: any) => 
                  acc + m.lessons.filter((l: any) => progress[l.id]).length, 0
                );
                const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

                return (
                  <div 
                    key={course.id} 
                    onClick={() => openCourse(course)}
                    className="bg-white border border-slate-200 rounded-[2rem] p-6 cursor-pointer hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/5 transition-all group flex flex-col"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-brand-primary/10 transition-colors">
                      <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-brand-primary transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{course.title}</h3>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2 flex-1">{course.description || "Curso completo com módulos e aulas."}</p>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>{completedLessons} de {totalLessons} aulas</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Course or Trail View
  const isCourseView = view === 'course';
  const title = isCourseView ? activeCourse?.title : activeTrail?.title;
  const description = isCourseView ? activeCourse?.description : activeTrail?.description;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={goBack} className="text-slate-500 hover:text-slate-900 rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">{title}</h1>
          <p className="text-slate-500 text-sm">{description}</p>
        </div>
      </div>

      {!activeLesson ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-3xl border border-slate-100">
          <PlayCircle className="w-16 h-16 text-slate-200" />
          <h2 className="text-2xl font-black text-slate-900">Nenhuma aula disponível</h2>
          <p className="text-slate-500">Este conteúdo ainda não possui aulas cadastradas.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player & Details Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden relative shadow-xl flex items-center justify-center group">
              {activeLesson.video_id ? (
                <iframe 
                  src={activeLesson.video_id} 
                  className="absolute inset-0 w-full h-full border-0 z-20" 
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center space-y-4">
                      <PlayCircle className="w-16 h-16 text-white/80 mx-auto group-hover:scale-110 transition-transform cursor-pointer" />
                      <p className="text-white/60 font-medium text-sm">Nenhum vídeo configurado para esta aula</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Lesson Info & Upsell */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{activeLesson.title}</h2>
                  <p className="text-slate-500 mt-2 leading-relaxed">{activeLesson.description}</p>
                </div>
                <button 
                  onClick={(e) => toggleLessonProgress(activeLesson.id, e)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors shrink-0 ${
                    progress[activeLesson.id] 
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {progress[activeLesson.id] ? (
                    <><CheckCircle2 className="w-4 h-4" /> Concluída</>
                  ) : (
                    <><Circle className="w-4 h-4" /> Marcar como concluída</>
                  )}
                </button>
              </div>

              {/* Upsell / Tool Link */}
              {activeLesson.tool_link && (
                <div className="bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-black text-brand-primary">Coloque em prática agora</h4>
                    <p className="text-sm text-slate-600 font-medium mt-1">Use nossa IA para gerar a estratégia ensinada nesta aula.</p>
                  </div>
                  <Button 
                    onClick={() => navigate(activeLesson.tool_link)}
                    className="w-full sm:w-auto bg-brand-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 shrink-0"
                  >
                    Usar Ferramenta (1 Crédito)
                  </Button>
                </div>
              )}

              <div className="h-px bg-slate-100" />

              {/* Rating System */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Avalie esta aula:</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 transition-colors ${rating && rating >= star ? 'text-yellow-400' : 'text-slate-200 hover:text-yellow-200'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-secondary" />
                Dúvidas e Comentários
              </h3>

              <form onSubmit={handleCommentSubmit} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-500">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Deixe sua dúvida ou comentário..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!comment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="space-y-6 mt-8">
                {comments.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">Nenhum comentário ainda. Seja o primeiro!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 font-bold text-brand-primary">
                        {c.user.charAt(0)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{c.user}</span>
                          <span className="text-xs text-slate-400">{c.date}</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{c.text}</p>
                        <button className="text-xs font-bold text-slate-400 hover:text-brand-primary flex items-center gap-1 mt-2 transition-colors">
                          <ThumbsUp className="w-3 h-3" /> Curtir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Playlist */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="font-black text-slate-900">Conteúdo</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {isCourseView 
                    ? `${activeCourse.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0)} aulas disponíveis`
                    : `${activeTrail.trail_lessons?.length || 0} aulas na trilha`
                  }
                </p>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
                {isCourseView ? (
                  activeCourse.modules.map((module: any) => (
                    <div key={module.id} className="border-b border-slate-100 last:border-0">
                      <div className="p-4 bg-slate-50/50">
                        <h4 className="text-xs font-black text-slate-400 tracking-widest uppercase">{module.title}</h4>
                      </div>
                      <div className="flex flex-col">
                        {module.lessons.map((lesson: any) => {
                          const isActive = activeLesson.id === lesson.id;
                          const isCompleted = progress[lesson.id];
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setActiveLesson(lesson)}
                              className={`p-4 text-left transition-colors flex gap-3 group ${isActive ? 'bg-brand-primary/5' : 'hover:bg-slate-50'}`}
                            >
                              <div onClick={(e) => toggleLessonProgress(lesson.id, e)} className={`mt-0.5 shrink-0 transition-colors ${isCompleted ? 'text-emerald-500' : 'text-slate-300 group-hover:text-brand-primary'}`}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className={`text-sm font-bold leading-tight ${isActive ? 'text-brand-primary' : 'text-slate-700'}`}>
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-slate-400 font-medium mt-1">{lesson.duration}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col">
                    {activeTrail.trail_lessons?.map((trailLesson: any) => {
                      const lesson = trailLesson.lesson;
                      if (!lesson) return null;
                      const isActive = activeLesson.id === lesson.id;
                      const isCompleted = progress[lesson.id];
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`p-4 text-left transition-colors flex gap-3 group border-b border-slate-100 last:border-0 ${isActive ? 'bg-brand-secondary/5' : 'hover:bg-slate-50'}`}
                        >
                          <div onClick={(e) => toggleLessonProgress(lesson.id, e)} className={`mt-0.5 shrink-0 transition-colors ${isCompleted ? 'text-emerald-500' : 'text-slate-300 group-hover:text-brand-secondary'}`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className={`text-sm font-bold leading-tight ${isActive ? 'text-brand-secondary' : 'text-slate-700'}`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-slate-400 font-medium mt-1">{lesson.duration}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
