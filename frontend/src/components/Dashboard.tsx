
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Users, MessageSquare } from "lucide-react";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";

const Dashboard = () => {
  const { connectionStatus, sessions, isLoading } = useWhatsAppConnection();

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: "Conectado",
          description: "WhatsApp conectado e pronto para uso",
          color: "bg-green-50 border-green-200 text-green-700"
        };
      case "disconnected":
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          text: "Desconectado",
          description: "Escaneie o QR Code para conectar",
          color: "bg-red-50 border-red-200 text-red-700"
        };
      case "initializing":
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          text: "Inicializando",
          description: "Aguarde enquanto preparamos sua conexão",
          color: "bg-blue-50 border-blue-200 text-blue-700"
        };
    }
  };

  const statusInfo = getStatusInfo();
  const activeSessionsCount = sessions.filter(s => s.status === 'connected').length;

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Dashboard</CardTitle>
        <CardDescription>Visão geral da sua conexão WhatsApp</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${statusInfo.color} flex items-center gap-3`}>
            {statusInfo.icon}
            <div>
              <h3 className="font-medium">Status</h3>
              <p className="text-sm">{statusInfo.text}</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Sessões Ativas</h3>
              <p className="text-sm">{isLoading ? "--" : activeSessionsCount}</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <MessageSquare className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Status API</h3>
              <p className="text-sm">{isLoading ? "--" : "Online"}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg border bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700">{statusInfo.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
