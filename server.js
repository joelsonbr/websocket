const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

// HTTP: Para criar o servidor que carrega o site no navegador.
// FS (File System): Para ler arquivos do seu computador (como HTML).
// PATH: Para garantir que os caminhos das pastas funcionem tanto no Windows quanto no Linux. 

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);
    // Lógica do filePath: Se você acessar localhost:3000/, ele entende que você quer o index.html que está dentro da pasta public.
    // ... leitura do arquivo ...

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(400);
            return res.end("Not Found");
        }

        const ext = path.extname(filePath);
        // const ext = path.extname(filePath);
        // : Esta linha extrai a extensão do arquivo (como .html, .css ou .js) a partir do caminho dele.

        let contentType = "text/html";
        // let contentType = "text/html";
        // : Aqui você define que, por padrão, o servidor vai assumir que o arquivo é uma página HTML.

        if (ext === ".css") contentType = "text/css";
        // let contentType = "text/html";
        // : Aqui você define que, por padrão, o servidor vai assumir que o arquivo é uma página HTML.
        if (ext === ".js") contentType = "text/javascript"
        // if (ext === ".js") contentType = "text/javascript";
        // : Esta condição verifica se o arquivo é um script .js e ajusta o tipo para que o navegador saiba que deve executar um código.

        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
        // res.writeHead(200, { "Content-Type": contentType });
        // : O servidor envia uma resposta de sucesso (200) informando ao navegador exatamente qual é o formato do conteúdo.
        // res.writeHead(200, { "Content-Type": contentType });
        // : O servidor envia uma resposta de sucesso (200) informando ao navegador exatamente qual é o formato do conteúdo.
    });
    // fs.readFile: Ele tenta ler o arquivo. Se conseguir, envia o conteúdo para o seu navegador (status 200). Se não encontrar, dá erro (404).
});
// Aqui  ele cria um servidor na porta 3000.

const wss = new WebSocket.Server({ server });
let online = 0; // Variável global para contar usuários
// WSS: (WebSocket Server) está "pendurado" no servidor HTTP. Eles trabalham juntos na mesma porta.
// ONLINE: Essa variável fica fora dos eventos porque ela é 'contador global'. Se ficasse dentro do "on("connection")", ela zeraria toda hora.

function randomColor() {
    return '#' + Math.floor(Math.random() * 16777315).toString(16)
}

wss.on("connection", (ws) => {

    online++;
    broadcastOnline();

    ws.userColor = randomColor()

    ws.on("message", (msg) => {
        const data = msg.toString()
        const payload = JSON.stringify({
            type: "message",
            message: data,
            color: ws.userColor
        })

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload)
            }
        })
    });
    // O Eco (ws.on("message"))
    // Diferente do código anterior, este não envia para todo mundo. Ele envia um "echo" (eco) apenas para quem mandou a mensagem. É como um teste para o usuário saber que o servidor recebeu o que ele digitou.

    ws.on("close", () => {
        online--;
        broadcastOnline();
    });
    // O Fechamento (ws.on("close"))
    // online--: Alguém fechou a aba? Subtrai 1 do contador e avisa os outros.
});
// Evento de Conexão (wss.on("connection"))
// Tudo aqui dentro acontece uma vez para cada pessoa que entra no site:
// online++: Alguém entrou? Soma 1 no contador.
// broadcastOnline(): Chama a função (que explicarei abaixo) para avisar todo mundo que o número de pessoas mudou.

function broadcastOnline() {
    const payload = JSON.stringify({
        type: "online",
        count: online
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload)
        }
    });
    // clients: É uma lista automática que o servidor mantém com todos os navegadores que abriram o seu site.
    // if (client.readyState === WebSocket.OPEN): É uma checagem de segurança. 
    // O servidor verifica se a conexão daquela pessoa ainda está ativa e "viva" antes de tentar falar com ela. 
    // Isso evita erros com pessoas que acabaram de cair a internet ou fecharam a aba.
    // client.send(payload): Se estiver tudo certo, o servidor "empurra" o pacote de dados (payload) para o navegador daquela pessoa específica
}
// Função de Broadcast (broadcastOnline)
// Esta função é o "alto-falante" do servidor.
// Ela transforma o número de pessoas em um texto (JSON) e percorre cada cliente conectado (forEach) enviando a atualização. É por isso que, quando você abre uma aba nova, o número muda em todas as outras abas abertas.

server.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000")
})
// Inicialização
// Dá o "start" no motor. Sem essa linha, nada funciona.

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-

/* Resumo do Fluxo:
Você acessa o link -> O Escopo HTTP te entrega o HTML.

O HTML abre um WebSocket -> O Escopo de Conexão te recebe.

O Servidor conta você -> O Escopo de Broadcast avisa todo mundo que agora tem +1 online. */