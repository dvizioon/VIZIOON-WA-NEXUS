
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, MessageSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { whatsappService } from "@/services/whatsappService";

// Tipo de dados para um contato
interface Contact {
  name: string;
  number: string;
  pushname?: string;
}

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extrair sessão da URL se disponível
  const queryParams = new URLSearchParams(location.search);
  const sessionName = queryParams.get('session') || 'default';

  useEffect(() => {
    loadContacts();
  }, [sessionName]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const response = await whatsappService.getContacts(sessionName);
      
      if (response.success && response.contacts) {
        setContacts(response.contacts);
        setFilteredContacts(response.contacts);
      } else {
        throw new Error(response.message || "Erro ao carregar contatos");
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      toast({
        title: "Erro ao carregar contatos",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(
        contact => 
          contact.name.toLowerCase().includes(query) || 
          contact.number.includes(query)
      );
      setFilteredContacts(filtered);
    }
  };

  const handleMessageClick = (contact: Contact) => {
    navigate(`/messages?contactId=${contact.number}&name=${encodeURIComponent(contact.name)}&number=${contact.number}&session=${sessionName}`);
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
          <CardTitle>Contatos - Sessão: {sessionName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar contatos por nome ou número..."
              className="pl-9"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="space-y-3">
            {isLoading && 
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-28" />
                </div>
              ))
            }

            {!isLoading && filteredContacts.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Nenhum contato encontrado</p>
              </div>
            )}

            {!isLoading && filteredContacts.map((contact, idx) => (
              <div 
                key={`${contact.number}-${idx}`}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-sm text-gray-500">{contact.number}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleMessageClick(contact)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mensagem
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactsPage;
