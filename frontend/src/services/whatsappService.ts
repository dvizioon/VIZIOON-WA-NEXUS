
import api from './api';

// Serviço para gerenciar conexões e sessões WhatsApp
export const whatsappService = {
  // Verificar status da API
  getStatus: async () => {
    const response = await api.get('/api/status');
    return response.data;
  },

  // Obter QR Code para conectar
  getQRCode: async (sessionName = 'default') => {
    const response = await api.get(`/api/qrcode?session=${sessionName}`);
    return response.data;
  },

  // Listar todas as sessões
  getSessions: async () => {
    const response = await api.get('/api/sessions');
    return response.data;
  },

  // Criar nova sessão
  createSession: async (sessionName: string) => {
    const response = await api.post('/api/sessions', { sessionName });
    return response.data;
  },

  // Excluir uma sessão
  deleteSession: async (sessionName: string) => {
    const response = await api.delete(`/api/sessions/${sessionName}`);
    return response.data;
  },

  // Obter contatos
  getContacts: async (sessionName = 'default') => {
    const response = await api.get(`/api/contacts?session=${sessionName}`);
    return response.data;
  },

  // Enviar mensagem
  sendMessage: async (number: string, message: string, session = 'default') => {
    const response = await api.post('/api/messages', { number, message, session });
    return response.data;
  },

  // Verificar se número existe no WhatsApp
  checkNumber: async (number: string, session = 'default') => {
    const response = await api.get(`/api/check-number?number=${number}&session=${session}`);
    return response.data;
  }
};
