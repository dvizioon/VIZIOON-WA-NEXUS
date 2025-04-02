require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Configuração do Servidor Express
const app = express();
const PORT = process.env.PORT || 7123;

// Middleware de Configuração
// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'https://vizioon-wa-nexus.vercel.app', 
    // 'http://localhost:3000',  // Para desenvolvimento
    '*'  // Modo permissivo (não recomendado para produção)
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Variáveis Globais de Gerenciamento de Sessão
let qrCodeData = null;
let activeClients = new Map();

/**
 * Função para criar um novo cliente WhatsApp
 * @param {string} sessionName - Nome da sessão
 * @returns {Client} Instância do cliente WhatsApp
 */
function createWhatsAppClient(sessionName = 'default') {
    // Configurar caminho de sessão
    const sessionPath = path.join('./whatsapp_sessions', sessionName);
    
    // Criar pasta de sessão se não existir
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }
    
    // Configurar cliente WhatsApp
    const client = new Client({
        authStrategy: new LocalAuth({
            dataPath: sessionPath
        }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        }
    });

    // Eventos do Cliente WhatsApp
    client.on('qr', (qr) => {
        console.log(`QR Code gerado para sessão ${sessionName}:`, qr);
        qrCodeData = { session: sessionName, qrcode: qr };
    });

    client.on('authenticated', () => {
        console.log(`WhatsApp autenticado na sessão ${sessionName}! Sessão salva.`);
        qrCodeData = null;
    });

    client.on('ready', () => {
        console.log(`WhatsApp conectado na sessão ${sessionName} e pronto para uso!`);
        
        activeClients.set(sessionName, {
            client: client,
            info: client.info,
            status: 'connected',
            connectedAt: new Date().toISOString()
        });
    });

    client.on('disconnected', (reason) => {
        console.log(`Sessão ${sessionName} desconectada: ${reason}`);
        activeClients.delete(sessionName);
    });

    return client;
}

// ROTAS DA API

// Rota de status do serviço
app.get('/api/status', (req, res) => {
    res.json({
        status: 'API Online',
        sessoes: activeClients.size,
        clients: Array.from(activeClients.keys())
    });
});

// Rota para gerar QR Code
app.get('/api/qrcode', async (req, res) => {
    try {
        const sessionName = req.query.session || 'default';
        
        // Criar novo cliente se não existir
        if (!activeClients.has(sessionName)) {
            const newClient = createWhatsAppClient(sessionName);
            newClient.initialize();
        }

        // Esperar QR Code ser gerado
        const generateQR = () => {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Tempo limite para geração do QR Code excedido'));
                }, 30000);

                const checkQR = setInterval(() => {
                    if (qrCodeData && qrCodeData.session === sessionName) {
                        clearInterval(checkQR);
                        clearTimeout(timeout);
                        resolve(qrCodeData.qrcode);
                    }
                }, 500);
            });
        };

        const qr = await generateQR();
        const qrImage = await qrcode.toDataURL(qr);

        res.json({
            success: true,
            session: sessionName,
            qrCode: qrImage
        });
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Rota para listar sessões
app.get('/api/sessions', (req, res) => {
    const sessions = Array.from(activeClients.entries()).map(([name, data]) => ({
        name,
        status: data.status,
        number: data.info?.wid?.user,
        connectedAt: data.connectedAt
    }));

    res.json({
        success: true,
        sessions
    });
});

// Rota para criar nova sessão
app.post('/api/sessions', (req, res) => {
    const { sessionName } = req.body;
    
    if (!sessionName || sessionName.trim() === '') {
        return res.status(400).json({ 
            success: false, 
            message: 'Nome da sessão é obrigatório' 
        });
    }
    
    if (activeClients.has(sessionName)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Já existe uma sessão com este nome' 
        });
    }
    
    const client = createWhatsAppClient(sessionName);
    client.initialize();
    
    res.status(201).json({ 
        success: true, 
        message: 'Sessão criada com sucesso. Escaneie o QR Code para conectar.' 
    });
});

// Rota para desconectar sessão
app.delete('/api/sessions/:sessionName', async (req, res) => {
    const { sessionName } = req.params;
    
    if (activeClients.has(sessionName)) {
        const clientData = activeClients.get(sessionName);
        try {
            await clientData.client.logout();
            await clientData.client.destroy();
            activeClients.delete(sessionName);
            
            res.json({ 
                success: true, 
                message: `Sessão ${sessionName} desconectada com sucesso` 
            });
        } catch (error) {
            console.error(`Erro ao desconectar sessão ${sessionName}:`, error);
            res.status(500).json({ 
                success: false, 
                message: `Erro ao desconectar sessão: ${error.message}` 
            });
        }
    } else {
        res.status(404).json({ 
            success: false, 
            message: 'Sessão não encontrada' 
        });
    }
});

// Rota para listar contatos
app.get('/api/contacts', async (req, res) => {
    const sessionName = req.query.session || 'default';
    
    if (!activeClients.has(sessionName)) {
        return res.status(404).json({ 
            success: false, 
            message: 'Sessão não encontrada' 
        });
    }
    
    try {
        const client = activeClients.get(sessionName).client;
        const contacts = await client.getContacts();
        
        const formattedContacts = contacts
            .filter(contact => 
                contact.name && 
                contact.id && 
                contact.id.server === 'c.us' && 
                !contact.isMe &&
                !contact.isGroup
            )
            .map(contact => ({
                name: contact.name,
                number: contact.id.user,
                pushname: contact.pushname
            }));
        
        res.json({
            success: true,
            total: formattedContacts.length,
            contacts: formattedContacts
        });
    } catch (error) {
        console.error('Erro ao listar contatos:', error);
        res.status(500).json({ 
            success: false, 
            message: `Erro ao listar contatos: ${error.message}` 
        });
    }
});

// Rota para enviar mensagem
app.post('/api/messages', async (req, res) => {
    try {
        const { number, message, session = 'default' } = req.body;
        
        // Validações
        if (!number || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Número e mensagem são obrigatórios' 
            });
        }
        
        if (!activeClients.has(session)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Sessão não encontrada' 
            });
        }
        
        // Obter cliente da sessão
        const clientData = activeClients.get(session);
        const client = clientData.client;
        
        // Formatar número
        const formattedNumber = number.replace(/[^\d]/g, '');
        const chatId = `${formattedNumber}@c.us`;
        
        // Enviar mensagem
        const response = await client.sendMessage(chatId, message);
        
        // Resposta de sucesso
        res.status(200).json({ 
            success: true, 
            message: 'Mensagem enviada com sucesso!', 
            messageId: response.id._serialized 
        });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao enviar mensagem: ' + error.message 
        });
    }
});

// Rota para verificar número de WhatsApp
app.get('/api/check-number', async (req, res) => {
    const { number, session = 'default' } = req.query;
    
    if (!number) {
        return res.status(400).json({ 
            success: false, 
            message: 'Número é obrigatório' 
        });
    }
    
    if (!activeClients.has(session)) {
        return res.status(404).json({ 
            success: false, 
            message: 'Sessão não encontrada' 
        });
    }
    
    try {
        const client = activeClients.get(session).client;
        const formattedNumber = number.replace(/[^\d]/g, '');
        const numberExists = await client.isRegisteredUser(`${formattedNumber}@c.us`);
        
        res.json({
            success: true,
            registered: numberExists
        });
    } catch (error) {
        console.error('Erro ao verificar número:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao verificar número: ' + error.message 
        });
    }
});

// Iniciar Servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor WhatsApp API rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

// Iniciar cliente padrão
const defaultClient = createWhatsAppClient();
defaultClient.initialize();

// Tratamento de erros
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM recebido. Desligando graciosamente...');
    server.close(() => {
        console.log('Servidor fechado.');
        activeClients.forEach(async (clientData) => {
            try {
                await clientData.client.destroy();
            } catch (error) {
                console.error('Erro ao destruir cliente:', error);
            }
        });
        process.exit(0);
    });
});

module.exports = app; // Para possível uso em testes