
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { whatsappService } from "@/services/whatsappService";
import { useWhatsAppConnection } from "@/hooks/useWhatsAppConnection";

const QRCodePage = () => {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "connected">("loading");
  const { connectionStatus, refreshStatus } = useWhatsAppConnection();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extrair sessão da URL se disponível
  const queryParams = new URLSearchParams(location.search);
  const sessionName = queryParams.get('session') || 'default';

  useEffect(() => {
    // Se já estiver conectado, não precisa gerar QR code
    if (connectionStatus === 'connected') {
      setStatus('connected');
      return;
    }

    generateQRCode();
  }, [connectionStatus]);

  const generateQRCode = async () => {
    try {
      setStatus("loading");
      setQrCodeData(null);
      
      const result = await whatsappService.getQRCode(sessionName);
      
      if (result.success && result.qrCode) {
        setQrCodeData(result.qrCode);
        setStatus("ready");
      } else {
        throw new Error("Falha ao gerar o QR Code");
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Não foi possível gerar o código QR. Tente novamente.",
        variant: "destructive"
      });
      setStatus("loading");
    }
  };

  const refreshQRCode = () => {
    generateQRCode();
    
    toast({
      title: "Atualizando QR Code",
      description: "Gerando um novo código para escaneamento",
    });
  };

  const handleBackClick = () => {
    refreshStatus(); // Atualiza o status antes de voltar
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center gap-2" 
        onClick={handleBackClick}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
      </Button>

      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-center">Conectar WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {status === "loading" && (
            <div className="h-64 w-64 flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
              <p className="text-gray-500">Gerando QR Code...</p>
            </div>
          )}

          {status === "ready" && qrCodeData && (
            <div className="relative">
              <img 
                src={qrCodeData} 
                alt="QR Code para conexão do WhatsApp" 
                className="h-64 w-64 border-2 border-green-500 rounded-lg"
              />
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-700 text-sm font-medium">⚠️ Escaneie este QR Code no seu WhatsApp</p>
                <p className="text-yellow-600 text-xs mt-1">Este código expira em 20 segundos. Atualize se necessário.</p>
              </div>
            </div>
          )}

          {status === "connected" && (
            <div className="h-64 w-64 flex items-center justify-center bg-green-50 rounded-lg border-2 border-green-500">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium">WhatsApp Conectado!</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button 
            onClick={refreshQRCode} 
            disabled={status === "loading" || status === "connected"}
            className="bg-green-600 hover:bg-green-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar QR Code
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QRCodePage;
