
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Phone, Check, CheckCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { whatsappService } from "@/services/whatsappService";

// Tipo para uma mensagem
interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isSent: boolean;
  status: "sending" | "sent" | "delivered" | "read";
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [contactName, setContactName] = useState("Contato");
  const [contactNumber, setContactNumber] = useState("");
  const [sessionName, setSessionName] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Extrair parâmetros da URL
    const params = new URLSearchParams(location.search);
    const name = params.get("name");
    const number = params.get("number");
    const session = params.get("session");
    
    if (name) setContactName(name);
    if (number) setContactNumber(number);
    if (session) setSessionName(session);
    
    // Simulando o carregamento de mensagens anteriores
    // Em uma implementação real, você buscaria as mensagens da API
    const mockMessages: Message[] = [
      {
        id: "1",
        text: "Olá, como posso ajudar?",
        timestamp: new Date(Date.now() - 3600000),
        isSent: false,
        status: "read"
      },
      {
        id: "2",
        text: "Estou com uma dúvida sobre o serviço.",
        timestamp: new Date(Date.now() - 3500000),
        isSent: true,
        status: "read"
      },
      {
        id: "3",
        text: "Pode me fornecer mais detalhes?",
        timestamp: new Date(Date.now() - 3400000),
        isSent: false,
        status: "read"
      }
    ];
    
    setMessages(mockMessages);
  }, [location.search]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Criar nova mensagem
    const newMsg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date(),
      isSent: true,
      status: "sending"
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");
    setIsLoading(true);
    
    try {
      // Enviar mensagem para a API
      const response = await whatsappService.sendMessage(contactNumber, newMessage, sessionName);
      
      if (response.success) {
        // Atualizar status da mensagem para "enviada"
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMsg.id ? { ...msg, status: "sent" } : msg
          )
        );
        
        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi enviada com sucesso",
        });
        
        // Simulando entrega e leitura
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === newMsg.id ? { ...msg, status: "delivered" } : msg
            )
          );
          
          setTimeout(() => {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === newMsg.id ? { ...msg, status: "read" } : msg
              )
            );
          }, 2000);
        }, 1000);
      } else {
        throw new Error(response.message || "Erro ao enviar mensagem");
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      
      // Atualizar status da mensagem para refletir o erro
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMsg.id ? { ...msg, text: `${msg.text} (falha ao enviar)` } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <div className="h-3 w-3 rounded-full bg-gray-300 animate-pulse" />;
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center gap-2" 
        onClick={() => navigate(`/contacts?session=${sessionName}`)}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar aos contatos
      </Button>

      <Card className="bg-white shadow-md">
        <CardHeader className="bg-green-600 text-white py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                {contactName.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-lg">{contactName}</CardTitle>
                <p className="text-xs text-green-100">{contactNumber}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-green-700 rounded-full">
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto bg-gray-50 p-4">
            <div className="space-y-3">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isSent 
                        ? "bg-green-100 text-green-900" 
                        : "bg-white border text-gray-800"
                    }`}
                  >
                    <p>{message.text}</p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {message.isSent && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="resize-none min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                className="bg-green-600 hover:bg-green-700 self-end"
                disabled={isLoading || !newMessage.trim()}
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesPage;
