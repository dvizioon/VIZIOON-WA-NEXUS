
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, QrCode, LayoutDashboard, Server } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";

const Index = () => {
  const { connectionStatus } = useWhatsAppConnection();
  const navigate = useNavigate();

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">WhatsApp Nexus API</h1>
        <p className="text-lg text-gray-600">Gerenciador de Conexões e Mensagens</p>
      </header>

      <Dashboard />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500"
          onClick={() => handleCardClick("/qrcode")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-green-600" />
              Conectar WhatsApp
            </CardTitle>
            <CardDescription>
              Escaneie o QR Code para conectar uma conta do WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
              {connectionStatus === "connected" ? (
                <p className="text-green-600 font-medium">WhatsApp conectado</p>
              ) : (
                <p className="text-gray-500">Escaneie o QR Code para conectar</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              {connectionStatus === "connected" ? "Gerenciar Conexão" : "Conectar Agora"}
            </Button>
          </CardFooter>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
          onClick={() => handleCardClick("/contacts")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Contatos
            </CardTitle>
            <CardDescription>
              Gerencie e envie mensagens para seus contatos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Acesse sua lista de contatos</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Ver Contatos
            </Button>
          </CardFooter>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500"
          onClick={() => handleCardClick("/messages")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Mensagens
            </CardTitle>
            <CardDescription>
              Envie mensagens para contatos ou grupos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Envie mensagens diretamente</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Enviar Mensagem
            </Button>
          </CardFooter>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-amber-500"
          onClick={() => handleCardClick("/sessions")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-amber-600" />
              Sessões
            </CardTitle>
            <CardDescription>
              Gerencie múltiplas sessões do WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Administre sessões ativas</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-amber-600 hover:bg-amber-700">
              Gerenciar Sessões
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
