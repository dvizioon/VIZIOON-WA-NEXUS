
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { whatsappService } from "@/services/whatsappService";

interface Session {
  name: string;
  status: "connected" | "disconnected";
  number?: string;
  connectedAt?: string;
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSessionName, setNewSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await whatsappService.getSessions();
      
      if (response.success && response.sessions) {
        setSessions(response.sessions);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: "Erro ao carregar sessões",
        description: "Não foi possível obter a lista de sessões",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, forneça um nome para a sessão",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const response = await whatsappService.createSession(newSessionName.trim());
      
      if (response.success) {
        toast({
          title: "Sessão criada",
          description: `A sessão "${newSessionName}" foi criada com sucesso`,
        });
        setNewSessionName("");
        
        // Recarregar lista de sessões
        await loadSessions();
        
        // Redirecionar para QR code para conectar a nova sessão
        navigate(`/qrcode?session=${newSessionName.trim()}`);
      } else {
        throw new Error(response.message || "Erro ao criar sessão");
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast({
        title: "Erro ao criar sessão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = async (sessionName: string) => {
    try {
      const response = await whatsappService.deleteSession(sessionName);
      
      if (response.success) {
        setSessions(prev => prev.filter(s => s.name !== sessionName));
        
        toast({
          title: "Sessão removida",
          description: `A sessão "${sessionName}" foi removida com sucesso`,
        });
      } else {
        throw new Error(response.message || "Erro ao remover sessão");
      }
    } catch (error) {
      console.error('Erro ao excluir sessão:', error);
      toast({
        title: "Erro ao remover sessão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const handleRefreshSession = (sessionName: string) => {
    // Redirecionar para página de QR code com sessão específica
    navigate(`/qrcode?session=${sessionName}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center gap-2" 
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
      </Button>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Gerenciar Sessões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Nome da nova sessão"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              disabled={isCreating}
            />
            <Button 
              onClick={handleCreateSession}
              disabled={isCreating || !newSessionName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Criar
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading && 
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-5 w-1/3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-2/5 bg-gray-200 rounded"></div>
                </div>
              ))
            }

            {!isLoading && sessions.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhuma sessão encontrada</p>
              </div>
            )}

            {!isLoading && sessions.map(session => (
              <div 
                key={session.name}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{session.name}</h3>
                      <Badge variant={session.status === "connected" ? "success" : "destructive"}>
                        {session.status === "connected" ? "Conectado" : "Desconectado"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">ID: {session.name}</p>
                    {session.status === "connected" && (
                      <>
                        <p className="text-sm text-gray-500">
                          Telefone: {session.number || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Conectado desde: {formatDate(session.connectedAt)}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-blue-500 border-blue-200 hover:bg-blue-50"
                      onClick={() => handleRefreshSession(session.name)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteSession(session.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionsPage;
