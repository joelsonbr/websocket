// ========================================
// ABERTURA DA CONEXÃO WEBSOCKET
// ========================================

// Cria um canal WebSocket persistente com o servidor.
// "ws://" indica protocolo WebSocket.
// A conexão permanece aberta para comunicação em tempo real.
const socket = new WebSocket("ws://localhost:3000");


// ========================================
// REFERÊNCIAS DO DOM (INTERFACE)
// ========================================

// Container onde as mensagens serão exibidas.
const log = document.getElementById("log");

// Elemento que mostra quantidade de usuários online.
const onlineSpan = document.getElementById("online");

// Campo de texto onde o usuário digita a mensagem.
const input = document.getElementById("input");


// ========================================
// EVENTO: CONEXÃO ESTABELECIDA
// ========================================

// Executa quando o handshake WebSocket é concluído.
// A partir daqui já é possível enviar dados.
socket.onopen = () => {
    console.log("Conexão estabelecida com sucesso.");
};


// ========================================
// EVENTO: RECEBIMENTO DE DADOS
// ========================================

// Dispara toda vez que o servidor envia algo.
socket.onmessage = (event) => {

    // O servidor envia dados como string.
    // JSON.parse converte para objeto JavaScript.
    const data = JSON.parse(event.data);


    // ------------------------------------
    // ATUALIZAÇÃO DE USUÁRIOS ONLINE
    // ------------------------------------

    // Se o servidor enviou atualização de usuários
    if (data.type === "online") {

        // Atualiza o número exibido na tela
        onlineSpan.textContent = data.count;
    }


    // ------------------------------------
    // RECEBIMENTO DE MENSAGEM DE CHAT
    // ------------------------------------

    if (data.type === "message") {

        // Cria um novo elemento <div> dinamicamente
        const div = document.createElement("div");

        // Aplica a classe CSS que define o estilo do balão
        div.classList.add("message");

        // Define o texto da mensagem
        div.textContent = data.message;

        // Aplica a cor enviada pelo servidor
        // Cada usuário possui uma cor fixa definida no backend

        // Define a cor de fundo
        div.style.backgroundColor = data.color;


        function getContrastColor(hex) {
            // Remove o '#'
            const color = hex.replace("#", "")

            // Converte para o valores RGB
            const r = parseInt(color.substring(0, 2), 16)
            const g = parseInt(color.substring(2, 4), 16)
            const b = parseInt(color.substring(4, 6), 16)

            // Fórmula de luminância perceptiva
            const luminance = (0.299 * r + 0.587 * g + 0.144 * b)

            // Se for cor clara -> texto preto
            // Se for cor escura -> texto branco
            return luminance > 186 ? "#000000" : "#FFFFFF"
        }

        // Aplica a cor ideal de texto
        div.style.color = getContrastColor(data.color)

        // Insere o balão no container de mensagens
        log.appendChild(div);

        // Faz a rolagem automática para a última mensagem
        log.scrollTop = log.scrollHeight;
    }
};


// ========================================
// ENVIO DE MENSAGEM
// ========================================

// Função chamada pelo botão "Enviar"
function send() {

    // Remove espaços extras e impede envio vazio
    if (input.value.trim() === "") return;

    // Envia apenas o texto puro para o servidor
    // O servidor será responsável por:
    // - adicionar a cor
    // - distribuir para todos os clientes
    socket.send(input.value);

    // Limpa o campo após envio
    input.value = "";
}


// ========================================
// RESUMO DO FLUXO
// ========================================

/*
1) Cliente abre conexão WebSocket.
2) Servidor aceita e mantém canal aberto.
3) Cliente envia texto com socket.send().
4) Servidor adiciona metadados (cor, tipo).
5) Servidor faz broadcast para todos.
6) Cliente recebe, cria balão e aplica a cor.
*/