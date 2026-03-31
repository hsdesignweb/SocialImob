import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Star, 
  Sparkles, 
  ArrowLeft, 
  BookOpen, 
  Lightbulb, 
  Instagram, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Check,
  X,
  AlertCircle,
  Settings,
  Search,
  Circle,
  Camera,
  LogOut,
  Clock,
  AlignLeft,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { PlannerPost, ImportantDate } from '@/types';
import { seedPlannerData } from '@/services/plannerSeed';

const ADMIN_EMAIL = 'hebert.ss@gmail.com';

export default function Planner() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [posts, setPosts] = useState<PlannerPost[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<PlannerPost> | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { consumeCredit } = useAuth();

  const formatText = (text: string | undefined | null) => {
    if (!text) return "";
    return text.replace(/\\n/g, '\n');
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Seed data if empty (first time)
      await seedPlannerData();

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: true });
      
      if (postsError) throw postsError;
      setPosts(postsData || []);

      const { data: datesData, error: datesError } = await supabase
        .from('important_dates')
        .select('*');
      
      if (datesError) throw datesError;
      setImportantDates(datesData || []);
    } catch (error) {
      console.error('Error fetching planner data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleOpenPanel = () => setIsEditing(true);
    const handleGoToToday = () => goToToday();

    window.addEventListener('open-planner-panel', handleOpenPanel);
    window.addEventListener('go-to-today', handleGoToToday);

    // Subscribe to changes
    const channel = supabase
      .channel('planner_changes')
      .on(
        'postgres_changes' as any, 
        { event: '*', schema: 'public', table: 'posts' }, 
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('open-planner-panel', handleOpenPanel);
      window.removeEventListener('go-to-today', handleGoToToday);
    };
  }, []);

  // Calendar Logic
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = [];
    // Padding for first week
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    // Actual days
    for (let i = 1; i <= days; i++) {
      calendarDays.push(new Date(year, month, i));
    }
    return calendarDays;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
  const yearName = currentDate.getFullYear();

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const selectedPosts = useMemo(() => {
    return posts.filter(p => p.date === selectedDate);
  }, [posts, selectedDate]);

  const filteredImportantDates = useMemo(() => {
    const monthDates = importantDates.filter(id => id.month === currentDate.getMonth());
    // Remove duplicates by label and day
    const unique = new Map();
    monthDates.forEach(d => {
      const key = `${d.day}-${d.label}`;
      if (!unique.has(key)) unique.set(key, d);
    });
    return Array.from(unique.values()).sort((a, b) => Number(a.day) - Number(b.day));
  }, [importantDates, currentDate]);

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // CRUD Operations
  const handleSavePost = async () => {
    if (!editingPost || !editingPost.title) return;

    try {
      const payload = {
        ...editingPost,
        date: editingPost.date || selectedDate,
        completed: editingPost.completed || 0
      };

      if (editingPost.id) {
        const { error } = await supabase.from('posts').update(payload).eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert([payload]);
        if (error) throw error;
      }
      setIsEditing(false);
      setEditingPost(null);
      fetchData();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const confirmDeletePost = async () => {
    if (!isAdmin || !postToDelete) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postToDelete);
      if (error) throw error;
      setPostToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeletePost = (id: string) => {
    if (!isAdmin) return;
    setPostToDelete(id);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleCompleted = async (post: PlannerPost) => {
    try {
      const newCompletedState = post.completed === 1 ? 0 : 1;
      const { error } = await supabase
        .from('posts')
        .update({ completed: newCompletedState })
        .eq('id', post.id);
      
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling post status:', error);
    }
  };

  const handleGenerateImage = async (post: PlannerPost) => {
    if (!user) return;
    
    if (user.credits < 50) {
      alert("Você precisa de pelo menos 50 créditos para gerar uma imagem.");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const prompt = `Crie uma imagem de fundo minimalista e profissional, formato 4:5, para um post de rede social de uma imobiliária. O tema do post é: "${post.title}". A imagem deve ter espaço vazio suficiente para adicionar texto por cima. Estilo moderno, elegante, iluminação suave.`;
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        // Consume credits
        await consumeCredit(50);
        
        // Update post with new image link
        const newMediaLink = post.media_link ? `${post.media_link}\n${data.imageUrl}` : data.imageUrl;
        
        const { error } = await supabase
          .from('posts')
          .update({ media_link: newMediaLink })
          .eq('id', post.id);
          
        if (error) throw error;
        
        fetchData();
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert("Houve um erro ao gerar a imagem. Tente novamente mais tarde.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-[320px] md:shrink-0 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col bg-white md:overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Calendar */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <button onClick={prevMonth} className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                <h3 className="font-black text-slate-900 text-sm tracking-wider">
                  {monthName} DE {yearName}
                </h3>
                <button onClick={nextMonth} className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-400"><ChevronRight className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, idx) => (
                  <span key={`${d}-${idx}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{d}</span>
                ))}
                {daysInMonth.map((day, i) => {
                  if (!day) return <div key={`pad-${i}`} />;
                  
                  const dateStr = day.toISOString().split('T')[0];
                  const dayPosts = posts.filter(p => p.date === dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;
                  const isCompleted = dayPosts.some(p => p.completed === 1);
                  const hasPlanned = dayPosts.some(p => p.completed === 0);

                  let bgColor = 'hover:bg-slate-50 text-slate-600';
                  let dotColor = '';

                  if (isSelected) {
                    bgColor = 'bg-slate-900 text-white shadow-md';
                  } else if (isCompleted) {
                    bgColor = 'bg-green-100 text-green-700 hover:bg-green-200';
                    dotColor = 'bg-green-500';
                  } else if (hasPlanned) {
                    bgColor = 'bg-blue-100 text-blue-700 hover:bg-blue-200';
                    dotColor = 'bg-blue-500';
                  } else if (isToday) {
                    bgColor = 'border-2 border-brand-primary text-brand-primary';
                  }

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`
                        relative aspect-square rounded-full flex items-center justify-center text-sm font-bold transition-all mx-auto w-10 h-10
                        ${bgColor}
                      `}
                    >
                      {day.getDate()}
                      {dotColor && !isSelected && (
                        <div className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${dotColor}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Important Dates */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                <Star className="w-3 h-3" />
                Datas Importantes
              </div>
              <div className="space-y-2">
                {filteredImportantDates.map((id) => (
                  <div 
                    key={id.id} 
                    className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-pointer group"
                    onClick={() => setSelectedDate(`${yearName}-${(id.month + 1).toString().padStart(2, '0')}-${id.day}`)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-black text-blue-600">
                      {id.day}
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{id.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legenda */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                Legenda
              </div>
              <div className="space-y-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200" />
                  <span className="text-sm font-medium text-slate-600">Planejado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 border border-green-200" />
                  <span className="text-sm font-medium text-slate-600">Publicado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900" />
                  <span className="text-sm font-medium text-slate-600">Selecionado</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:overflow-y-auto bg-slate-50/30 p-6 md:p-12">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {selectedPosts.length > 0 ? (
                  <div className="space-y-16">
                    {selectedPosts.map((post, index) => (
                      <div key={post.id} className="space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div>
                            <div className="text-blue-600 font-bold text-sm mb-2">
                              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                              {post.title}
                            </h2>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {isAdmin && (
                              <>
                                <Button variant="outline" onClick={() => { setEditingPost(post); setIsEditing(true); }} className="h-12 px-4 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" onClick={() => handleDeletePost(post.id)} className="h-12 px-4 rounded-full border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              onClick={() => toggleCompleted(post)}
                              className={`h-12 px-6 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${post.completed === 1 ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                            >
                              {post.completed === 1 ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Circle className="w-5 h-5" />}
                              {post.completed === 1 ? 'Feito' : 'Marcar como Feito'}
                            </Button>
                          </div>
                        </div>

                        <hr className="border-slate-200" />

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Left Column (Legenda & Dica) */}
                          <div className="lg:col-span-2 space-y-6 min-w-0">
                            <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
                              <CardHeader className="p-6 md:p-8 border-b border-slate-100 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <AlignLeft className="w-6 h-6 text-blue-500" />
                                  <CardTitle className="text-xl font-black text-slate-900">Legenda do Post</CardTitle>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => copyToClipboard(formatText(post.caption), 'caption')}
                                  className="h-10 px-4 rounded-xl text-slate-500 font-bold text-sm border-slate-200 hover:bg-slate-50 shrink-0"
                                >
                                  {copiedField === 'caption' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                  Copiar
                                </Button>
                              </CardHeader>
                              <CardContent className="p-6 md:p-8 space-y-6">
                                <div className="p-6 md:p-8 bg-slate-50 rounded-2xl text-slate-700 font-medium leading-relaxed whitespace-pre-wrap break-words text-base">
                                  {formatText(post.caption)}
                                </div>
                                
                                {post.script && (
                                  <div className="p-5 md:p-6 bg-yellow-50/80 border border-yellow-100 rounded-2xl flex gap-4 text-sm text-yellow-800 font-medium">
                                    <Lightbulb className="w-6 h-6 text-yellow-600 shrink-0" />
                                    <div className="min-w-0 break-words">
                                      <strong className="font-bold text-yellow-900 block mb-1">Dica: </strong>
                                      {formatText(post.script)}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>

                          {/* Right Column (Arte do dia) */}
                          <div className="space-y-6 min-w-0">
                            {/* Caixa 1: Imagem Pronta */}
                            <Card className="bg-slate-900 border-none shadow-xl rounded-3xl overflow-hidden text-white">
                              <CardContent className="p-6 md:p-8 space-y-6">
                                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Opção 1</div>
                                <p className="text-base font-medium text-slate-300 leading-relaxed">
                                  Baixe uma imagem pronta para usar em suas redes sociais.
                                </p>
                                
                                {post.media_link ? (
                                  <div className="space-y-3">
                                    {post.media_link.split('\n').filter(link => link.trim() !== '').map((link, idx) => (
                                      <a 
                                        key={idx}
                                        href={link.trim()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full h-14 bg-white text-slate-900 hover:bg-slate-50 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm px-4"
                                      >
                                        <Sparkles className="w-5 h-5 text-brand-secondary shrink-0" />
                                        <span className="truncate">Baixar Imagem Pronta</span>
                                        <ExternalLink className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="w-full h-14 bg-slate-800 text-slate-400 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 px-4">
                                    <Camera className="w-5 h-5 shrink-0" />
                                    <span className="truncate">Nenhuma imagem pronta disponível</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* Caixa 2: Gerar Imagem Personalizada */}
                            <Card className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                              <CardContent className="p-6 md:p-8 space-y-6">
                                <div className="text-[11px] font-black text-brand-primary uppercase tracking-widest">Opção 2</div>
                                <p className="text-base font-medium text-slate-700 leading-relaxed">
                                  Gere uma imagem exclusiva com IA baseada neste post.
                                </p>
                                
                                <Button 
                                  onClick={() => handleGenerateImage(post)}
                                  disabled={isGeneratingImage}
                                  className="w-full h-16 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white rounded-2xl font-black text-sm shadow-lg shadow-brand-primary/20 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                                >
                                  <div className="flex items-center gap-2">
                                    {isGeneratingImage ? (
                                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <ImageIcon className="w-5 h-5 shrink-0" />
                                    )}
                                    <span className="truncate">
                                      {isGeneratingImage ? 'Gerando Imagem...' : 'Gerar Imagem Personalizada'}
                                    </span>
                                  </div>
                                  {!isGeneratingImage && (
                                    <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">
                                      Consome 50 créditos
                                    </span>
                                  )}
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isAdmin && selectedPosts.length < 2 && (
                      <div className="pt-8 border-t border-slate-200 flex justify-center">
                        <Button 
                          onClick={() => {
                            setEditingPost({ title: '', format: 'Stories', script: '', caption: '', date: selectedDate, media_link: '' });
                            setIsEditing(true);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-14 rounded-full font-black shadow-xl"
                        >
                          <Plus className="w-5 h-5 mr-2" /> Adicionar outra opção para este dia
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                      <CalendarIcon className="w-12 h-12 text-slate-300" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-slate-900">Nenhum post planejado</h3>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                        Aproveite para criar um conteúdo autoral ou descansar!
                      </p>
                    </div>
                    {isAdmin && (
                      <Button 
                        onClick={() => {
                          setEditingPost({ title: '', format: 'Stories', script: '', caption: '' });
                          setIsEditing(true);
                        }}
                        className="bg-brand-primary hover:bg-blue-700 text-white px-10 h-16 rounded-full font-black shadow-xl shadow-brand-primary/20"
                      >
                        <Plus className="w-6 h-6 mr-3" /> Criar post para este dia
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Admin Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  {editingPost?.id ? 'Editar Post' : 'Novo Post'}
                </h3>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data de Publicação</label>
                    <input 
                      type="date" 
                      value={editingPost?.date || selectedDate}
                      onChange={e => setEditingPost({ ...editingPost, date: e.target.value })}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Formato</label>
                    <select 
                      value={editingPost?.format || 'Stories'}
                      onChange={e => setEditingPost({ ...editingPost, format: e.target.value })}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium"
                    >
                      <option value="Stories">Stories</option>
                      <option value="Reels">Reels</option>
                      <option value="Feed">Feed / Carrossel</option>
                      <option value="Imagem">Imagem</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Título</label>
                  <input 
                    type="text" 
                    value={editingPost?.title || ''}
                    onChange={e => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium"
                    placeholder="Ex: Tour pelo Imóvel"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Links de Imagens / Mídia (Um por linha)</label>
                  <textarea 
                    value={editingPost?.media_link || ''}
                    onChange={e => setEditingPost({ ...editingPost, media_link: e.target.value })}
                    className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium resize-none"
                    placeholder="Cole os links do Google Drive, Canva, etc. (Um por linha)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Dica / Direcionamento</label>
                  <textarea 
                    value={editingPost?.script || ''}
                    onChange={e => setEditingPost({ ...editingPost, script: e.target.value })}
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium resize-none"
                    placeholder="Dica ou direcionamento visual para o post..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Legenda Sugerida</label>
                  <textarea 
                    value={editingPost?.caption || ''}
                    onChange={e => setEditingPost({ ...editingPost, caption: e.target.value })}
                    className="w-full h-48 p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium resize-none"
                    placeholder="Escreva a legenda persuasiva aqui..."
                  />
                </div>
              </div>
              <div className="p-6 md:p-8 bg-slate-50 flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 h-14 rounded-xl font-black"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSavePost}
                  className="flex-1 h-14 bg-brand-primary hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-brand-primary/20"
                >
                  Salvar Post
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {postToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPostToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Excluir Post?</h3>
                <p className="text-slate-500 font-medium">
                  Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setPostToDelete(null)}
                  className="flex-1 h-14 rounded-xl font-black"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmDeletePost}
                  className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black shadow-lg shadow-red-500/20"
                >
                  Excluir
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
