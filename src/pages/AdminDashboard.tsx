import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Users, CreditCard, Activity, Search, ArrowLeft, Edit2, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface UserMetric {
  id: string;
  name: string;
  email: string;
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
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: editForm.name,
          credits: editForm.credits, 
          status: editForm.status,
          is_paid: editForm.status === 'active' || editForm.status === 'paid'
        })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { 
        ...u, 
        name: editForm.name,
        credits: editForm.credits, 
        status: editForm.status,
        is_paid: editForm.status === 'active' || editForm.status === 'paid'
      } : u));
      setEditingId(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Erro ao atualizar usuário.");
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="shrink-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Painel Administrativo</h1>
            <p className="text-slate-500 text-sm">Métricas e gestão de usuários do SocialImob Pro.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar usuário..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Total Usuários</p>
              <p className="text-2xl font-bold text-slate-900">{users.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Assinantes Ativos</p>
              <p className="text-2xl font-bold text-slate-900">{activePaidUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Créditos Consumidos</p>
              <p className="text-2xl font-bold text-slate-900">{totalCreditsUsed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500 italic">Carregando dados...</TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500 italic">Nenhum usuário encontrado.</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-slate-900">
                        {editingId === user.id ? (
                          <Input 
                            className="h-8 text-sm" 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        ) : (
                          user.name || 'Sem nome'
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">{user.email}</TableCell>
                      <TableCell>
                        {editingId === user.id ? (
                          <Input 
                            type="number" 
                            className="w-20 h-8" 
                            value={editForm.credits} 
                            onChange={(e) => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500" 
                                style={{ width: `${Math.min(100, Math.max(0, ((user.credits || 0) / 100) * 100))}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{user.credits || 0}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === user.id ? (
                          <select 
                            className="text-xs border border-slate-200 rounded p-1 outline-none"
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          >
                            <option value="trial">Trial</option>
                            <option value="active">Ativo</option>
                            <option value="pending_payment">Pendente</option>
                            <option value="expired">Expirado</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            user.is_paid ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {user.status}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === user.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleSave(user.id)} disabled={isSaving}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingId(null)} disabled={isSaving}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => handleEdit(user)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
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
