# Backend API WhatsApp

## 📋 Visão Geral

### Descrição do Projeto
Este backend permite integração completa com WhatsApp Web, oferecendo recursos avançados de comunicação e gerenciamento de sessões.

## 🚀 Funcionalidades Principais

### Gerenciamento de Sessões
- Múltiplas sessões de WhatsApp simultâneas
- Criação e gerenciamento de conexões
- Persistência de sessões
- Desconexão segura

### Recursos de Mensagem
- Envio de mensagens de texto
- Verificação de números de WhatsApp
- Listagem de contatos

## 🔧 Requisitos do Sistema

### Tecnologias
- Node.js (versão 16 ou superior)
- npm (gerenciador de pacotes)

### Dependências Principais
- Express.js
- whatsapp-web.js
- cors
- body-parser
- qrcode
- dotenv

## 📦 Instalação

### Passos para Instalação
1. Clone o repositório
```bash
git clone https://seu-repositorio/whatsapp-api.git
cd whatsapp-api
```

2. Instale as dependências
```bash
npm install
```

3. Configuração de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```
PORT=7123
# Outras configurações personalizadas
```

## 🌐 Rotas da API

### Status do Serviço
- **GET** `/api/status`
  - Verifica o status geral da API
  - Retorna informações sobre sessões ativas

### Gerenciamento de Sessões
- **GET** `/api/sessions`
  - Lista todas as sessões ativas
  - Retorna detalhes de cada sessão

- **POST** `/api/sessions`
  - Cria uma nova sessão de WhatsApp
  - Parâmetros:
    ```json
    {
      "sessionName": "nome_da_sessao"
    }
    ```

- **DELETE** `/api/sessions/:sessionName`
  - Desconecta e remove uma sessão específica

### Geração de QR Code
- **GET** `/api/qrcode`
  - Gera QR Code para autenticação
  - Parâmetros opcionais:
    - `session`: Nome da sessão (padrão: 'default')

### Contatos
- **GET** `/api/contacts`
  - Lista contatos da sessão
  - Parâmetros opcionais:
    - `session`: Nome da sessão (padrão: 'default')

### Mensagens
- **POST** `/api/messages`
  - Envia mensagem de texto
  - Payload:
    ```json
    {
      "number": "5511999999999",
      "message": "Olá, mundo!",
      "session": "nome_da_sessao"
    }
    ```

- **GET** `/api/check-number`
  - Verifica se um número está registrado no WhatsApp
  - Parâmetros:
    - `number`: Número para verificação
    - `session`: Nome da sessão (opcional)

## 🔒 Segurança

### Considerações de Segurança
- Conexões são criptografadas
- Sessões são isoladas
- Autenticação por QR Code
- Recomendado usar HTTPS em produção

### Boas Práticas
- Proteja o diretório de sessões
- Use variáveis de ambiente
- Implemente camada adicional de autenticação se necessário

## 🚀 Execução

### Modos de Execução

#### Desenvolvimento
```bash
npm run dev
# Usa nodemon para reinício automático
```

#### Produção
```bash
npm start
# Executa o servidor diretamente
```

## 📝 Exemplos de Uso

### JavaScript (Fetch API)
```javascript
// Criar Sessão
fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionName: 'minha_sessao' })
})

// Enviar Mensagem
fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    number: '5511999999999',
    message: 'Olá, mundo!',
    session: 'minha_sessao'
  })
})
```

### Curl
```bash
# Listar Sessões
curl http://localhost:7123/api/sessions

# Enviar Mensagem
curl -X POST http://localhost:7123/api/messages \
  -H "Content-Type: application/json" \
  -d '{"number":"5511999999999","message":"Teste","session":"default"}'
```

## 🔍 Solução de Problemas

### Erros Comuns
- Sessão não autenticada
- Número inválido
- Limite de requisições
- Problemas de conexão

### Logs
- Verificar console para mensagens de erro
- Erros são logados detalhadamente

## 🤝 Contribuição

### Como Contribuir
1. Faça fork do repositório
2. Crie branch de feature
3. Commit suas alterações
4. Abra um Pull Request

## 📋 Roadmap
- [ ] Suporte a mensagens de mídia
- [ ] Webhook para eventos
- [ ] Autenticação JWT
- [ ] Limite de requisições

## 📜 Licença
[Especificar licença do projeto]

## 📞 Suporte
- Abra issues no repositório
- Consulte documentação
- Entre em contato com mantenedores
