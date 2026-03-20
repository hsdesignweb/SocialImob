import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Users, CreditCard, Activity, Search, ArrowLeft, Edit2, Check, X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserMetric {
  id: string;
  name: string;
  email: string;
  phone?: string;
  credits: number;
  status: string;
  is_paid: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  console.log("AdminDashboard rendering...");
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string, credits: number, status: string }>({ name: "", credits: 0, status: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log("AdminDashboard mounted, fetching users...");
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("Fetching users from Supabase...");
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn("No data returned from Supabase, using mock data.");
        throw new Error("No data");
      }

      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users, using mock data:", error);
      // Mock data if table doesn't exist or error
      // Ensuring mock data is also sorted by date (newest first)
      const mockData = [
        { id: '4', name: 'Ana Costa', email: 'ana@exemplo.com', credits: 88, status: 'trial', is_paid: false, created_at: new Date(Date.now()).toISOString() },
        { id: '3', name: 'Pedro Alves', email: 'pedro@exemplo.com', credits: 0, status: 'pending_payment', is_paid: false, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '2', name: 'Maria Santos', email: 'maria@exemplo.com', credits: 12, status: 'active', is_paid: true, created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: '1', name: 'João Silva', email: 'joao@exemplo.com', credits: 45, status: 'active', is_paid: true, created_at: new Date(Date.now() - 259200000).toISOString() },
      ];
      setUsers(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserMetric) => {
    setEditingId(user.id);
    setEditForm({ name: user.name || "", credits: user.credits, status: user.status });
  };

  const handleSave = async (userId: string) => {
    setIsSaving(true);
    try {
      const isPaid = editForm.status === 'active' || editForm.status === 'paid';
      
      // Try RPC first
      let rpcError = null;
      try {
        const { error } = await supabase.rpc('admin_update_user', {
          p_user_id: userId,
          p_name: editForm.name,
          p_credits: editForm.credits,
          p_status: editForm.status,
          p_is_paid: isPaid
        });
        rpcError = error;
      } catch (e) {
        rpcError = e;
      }

      // If RPC fails (e.g., migration not applied), fallback to API endpoint
      if (rpcError) {
        console.log('RPC failed, falling back to API endpoint...', rpcError);
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch('/api/admin/update-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            admin_id: session?.user?.id,
            user_id: userId,
            name: editForm.name,
            credits: editForm.credits,
            status: editForm.status,
            is_paid: isPaid
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update user via API');
        }
      }
      
      setUsers(users.map(u => u.id === userId ? { 
        ...u, 
        name: editForm.name,
        credits: editForm.credits, 
        status: editForm.status,
        is_paid: isPaid
      } : u));
      setEditingId(null);
    } catch (error: any) {
      console.error("Error updating user:", error);
      alert(error.message || "Erro ao atualizar usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const totalCreditsUsed = users.reduce((acc, curr) => acc + (100 - (curr.credits || 0)), 0);
  const activePaidUsers = users.filter(u => u.is_paid).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/app')} 
            className="shrink-0 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-2xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Painel Boss</h1>
            <p className="text-slate-500 font-medium">Gestão estratégica de usuários e métricas.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar usuário..." 
            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none w-full md:w-80 text-slate-900 placeholder:text-slate-400 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-primary/5 rounded-2xl flex items-center justify-center border border-brand-primary/10">
              <Users className="w-8 h-8 text-brand-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-widest mb-1">Total Usuários</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{users.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-secondary/5 rounded-2xl flex items-center justify-center border border-brand-secondary/10">
              <CreditCard className="w-8 h-8 text-brand-secondary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-widest mb-1">Assinantes Ativos</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{activePaidUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
              <Activity className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-widest mb-1">Créditos Consumidos</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{totalCreditsUsed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
        <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
          <CardTitle className="text-xs font-black tracking-[0.3em] text-slate-400">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-black text-[10px] tracking-widest p-6">Nome</TableHead>
                  <TableHead className="text-slate-400 font-black text-[10px] tracking-widest p-6">Email / WhatsApp</TableHead>
                  <TableHead className="text-slate-400 font-black text-[10px] tracking-widest p-6">Créditos</TableHead>
                  <TableHead className="text-slate-400 font-black text-[10px] tracking-widest p-6">Status</TableHead>
                  <TableHead className="text-slate-400 font-black text-[10px] tracking-widest p-6">Cadastro</TableHead>
                  <TableHead className="text-slate-400 font-black text-[10px] tracking-widest p-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic font-medium">Carregando dados do sistema...</TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic font-medium">Nenhum usuário encontrado.</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                      <TableCell className="p-6">
                        {editingId === user.id ? (
                          <Input 
                            className="h-10 bg-white border-slate-200 text-slate-900 rounded-2xl px-6" 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        ) : (
                          <span className="text-slate-900 font-bold">{user.name || 'Sem nome'}</span>
                        )}
                      </TableCell>
                      <TableCell className="p-6 text-slate-500 font-medium">
                        <div>{user.email}</div>
                        {user.phone && <div className="text-xs text-slate-400 mt-1">{user.phone}</div>}
                      </TableCell>
                      <TableCell className="p-6">
                        {editingId === user.id ? (
                          <Input 
                            type="number" 
                            className="w-24 h-10 bg-white border-slate-200 text-slate-900 rounded-2xl px-4" 
                            value={editForm.credits} 
                            onChange={(e) => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })}
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-primary shadow-lg shadow-brand-primary/20" 
                                style={{ width: `${Math.min(100, Math.max(0, ((user.credits || 0) / 100) * 100))}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-slate-900">{user.credits || 0}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-6">
                        {editingId === user.id ? (
                          <select 
                            className="text-xs bg-white border border-slate-200 text-slate-900 rounded-2xl p-2 px-4 outline-none focus:border-brand-primary"
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          >
                            <option value="active">Ativo</option>
                            <option value="pending_payment">Pendente</option>
                            <option value="expired">Expirado</option>
                            <option value="suspended">Suspenso</option>
                          </select>
                        ) : (
                          <span className={`px-4 py-1 rounded-2xl text-[9px] font-black tracking-widest border ${
                            user.status === 'active' || user.status === 'paid'
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : user.status === 'suspended'
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-slate-50 text-slate-500 border-slate-100"
                          }`}>
                            {user.status === 'active' ? 'ATIVO' : 
                             user.status === 'trial' ? 'TRIAL' : 
                             user.status === 'pending_payment' ? 'PENDENTE' : 
                             user.status === 'expired' ? 'EXPIRADO' : 
                             user.status === 'suspended' ? 'SUSPENSO' : 
                             user.status.toUpperCase()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-6 text-xs text-slate-400 font-bold">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </TableCell>
                      <TableCell className="p-6 text-right">
                        {editingId === user.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-emerald-600 hover:bg-emerald-50 rounded-2xl" onClick={() => handleSave(user.id)} disabled={isSaving}>
                              <Check className="w-5 h-5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-red-500 hover:bg-red-50 rounded-2xl" onClick={() => setEditingId(null)} disabled={isSaving}>
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-2xl" onClick={() => handleEdit(user)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl" 
                              onClick={async () => {
                                if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
                                  try {
                                    const { error } = await supabase.rpc('delete_user', { user_id: user.id });
                                    if (error) throw error;
                                    setUsers(users.filter(u => u.id !== user.id));
                                    alert('Usuário excluído com sucesso.');
                                  } catch (error) {
                                    console.error('Erro ao excluir usuário:', error);
                                    alert('Erro ao excluir usuário.');
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
