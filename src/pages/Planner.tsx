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
  Clock
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const selectedPost = useMemo(() => {
    return posts.find(p => p.date === selectedDate);
  }, [posts, selectedDate]);

  const selectedImportantDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return importantDates.find(id => id.month === m - 1 && id.day === d.toString().padStart(2, '0'));
  }, [importantDates, selectedDate]);

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

  const completedPostsCount = useMemo(() => {
    return posts.filter(p => p.completed).length;
  }, [posts]);

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
        date: selectedDate,
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

  const handleDeletePost = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
        <aside className="w-full md:w-[300px] md:shrink-0 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col bg-white md:overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium text-sm"
              />
            </div>

            {/* Calendar */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <button onClick={prevMonth} className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                <h3 className="font-black text-slate-900 text-xs tracking-[0.15em]">
                  {monthName} DE {yearName}
                </h3>
                <button onClick={nextMonth} className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-400"><ChevronRight className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, idx) => (
                  <span key={`${d}-${idx}`} className="text-[10px] font-black text-slate-300 uppercase tracking-widest py-2">{d}</span>
                ))}
                {daysInMonth.map((day, i) => {
                  if (!day) return <div key={`pad-${i}`} />;
                  
                  const dateStr = day.toISOString().split('T')[0];
                  const hasPost = posts.find(p => p.date === dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`
                        aspect-square rounded-full flex items-center justify-center text-xs font-black transition-all relative
                        ${isSelected ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'}
                        ${isToday && !isSelected ? 'text-brand-primary' : ''}
                      `}
                    >
                      {day.getDate()}
                      {hasPost && (
                        <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Important Dates */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                <Star className="w-3 h-3" />
                Datas Importantes
              </div>
              <div className="space-y-1">
                {filteredImportantDates.map((id) => (
                  <div 
                    key={id.id} 
                    className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-pointer group"
                    onClick={() => setSelectedDate(`${yearName}-${(id.month + 1).toString().padStart(2, '0')}-${id.day}`)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600">
                      {id.day}
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{id.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:overflow-y-auto bg-white p-6 md:p-12">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {/* Post Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4">
                    <div className="text-sm font-black text-blue-600 tracking-wider">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-2xl">
                      {selectedPost?.title || "Nenhum post planejado"}
                    </h2>
                  </div>
                </div>

                {selectedPost ? (
                  <div className="grid lg:grid-cols-[1fr_320px] gap-12 items-start">
                    <div className="space-y-8">
                      {/* Caption Card */}
                      <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-5 md:p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MessageCircle className="w-5 h-5 text-blue-500" />
                            <CardTitle className="text-lg font-black text-slate-900">Legenda do Post</CardTitle>
                          </div>
                          <div 
                            onClick={() => copyToClipboard(formatText(selectedPost.caption), 'caption')}
                            className="flex items-center text-slate-400 font-bold text-xs gap-2 cursor-pointer hover:text-slate-600 transition-colors"
                          >
                            {copiedField === 'caption' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copiar
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 md:p-6 pt-0">
                          <div className="p-5 md:p-8 bg-slate-50/80 rounded-2xl md:rounded-3xl border border-slate-100 text-slate-900 font-medium leading-relaxed whitespace-pre-wrap text-sm">
                            {formatText(selectedPost.caption)}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Visual Direction Card */}
                      <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
                        <CardHeader className="p-5 md:p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            <CardTitle className="text-lg font-black text-slate-900">Direcionamento Visual</CardTitle>
                          </div>
                          <div 
                            onClick={() => copyToClipboard(formatText(selectedPost.script), 'script')}
                            className="flex items-center text-slate-400 font-bold text-xs gap-2 cursor-pointer hover:text-slate-600 transition-colors"
                          >
                            {copiedField === 'script' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            Copiar
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 md:p-6 pt-0">
                          <div className="p-5 md:p-8 bg-yellow-50/50 rounded-2xl md:rounded-3xl border border-yellow-100/50 text-slate-900 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                            {formatText(selectedPost.script)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                      {/* Suggested Format */}
                      <Card className="border-slate-100 shadow-sm rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 space-y-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Formato Sugerido</div>
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <CalendarIcon className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="text-xl font-black text-slate-900">Arte</div>
                            <div className="text-xs font-bold text-slate-400">Quadrado (1:1)</div>
                          </div>
                        </div>
                      </Card>

                      {/* Campaign Files */}
                      <Card className="bg-slate-900 text-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 space-y-8">
                        <div className="space-y-3">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Arquivos da Campanha</div>
                          <p className="text-sm font-medium text-slate-400 leading-relaxed">
                            Utilize fotos do seu próprio acervo ou visitas.
                          </p>
                        </div>
                        <Button className="w-full h-16 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl font-black flex items-center justify-center gap-4 transition-all">
                          <Camera className="w-6 h-6" />
                          Usar mídia própria
                        </Button>
                      </Card>

                      {isAdmin && (
                        <div className="flex gap-3">
                          <Button 
                            variant="outline"
                            onClick={() => { setEditingPost(selectedPost); setIsEditing(true); }}
                            className="flex-1 h-14 border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-50"
                          >
                            <Edit2 className="w-4 h-4 mr-2" /> Editar
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleDeletePost(selectedPost.id)}
                            className="h-14 border-slate-100 text-red-300 hover:text-red-500 hover:bg-red-50 font-bold rounded-2xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
                    <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center">
                      <CalendarIcon className="w-12 h-12 text-slate-200" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-slate-900">Nenhum post planejado</h3>
                      <p className="text-slate-400 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                        Aproveite para criar um conteúdo autoral ou descansar!
                      </p>
                    </div>
                    {isAdmin && (
                      <Button 
                        onClick={() => {
                          setEditingPost({ title: '', format: 'Stories', script: '', caption: '' });
                          setIsEditing(true);
                        }}
                        className="bg-brand-primary hover:bg-blue-700 text-white px-10 h-16 rounded-2xl font-black shadow-xl shadow-brand-primary/20"
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
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Formato</label>
                    <select 
                      value={editingPost?.format || 'Stories'}
                      onChange={e => setEditingPost({ ...editingPost, format: e.target.value })}
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium"
                    >
                      <option value="Stories">Stories</option>
                      <option value="Reels">Reels</option>
                      <option value="Feed">Feed / Carrossel</option>
                      <option value="WhatsApp">WhatsApp</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Roteiro / Sugestão</label>
                  <textarea 
                    value={editingPost?.script || ''}
                    onChange={e => setEditingPost({ ...editingPost, script: e.target.value })}
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium resize-none"
                    placeholder="O que o corretor deve fazer ou falar?"
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
    </div>
  );
}
