
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { whatsappService } from '@/services/whatsappService';

type ConnectionStatus = 'connected' | 'disconnected' | 'initializing';

export function useWhatsAppConnection() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('initializing');
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Verificar status inicial da conexão
  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const { sessions } = await whatsappService.getSessions();
      
      setSessions(sessions);
      
      if (sessions.length > 0 && sessions.some(s => s.status === 'connected')) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
      setConnectionStatus('disconnected');
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar status ao montar componente
  useEffect(() => {
    checkConnectionStatus();
    
    // Verificar status a cada 30 segundos
    const interval = setInterval(() => {
      checkConnectionStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    connectionStatus,
    sessions,
    isLoading,
    refreshStatus: checkConnectionStatus
  };
}
