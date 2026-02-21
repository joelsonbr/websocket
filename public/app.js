const socket = new WebSocket("ws://localhost:3000");
// Escopo de Inicialização (Abertura da Conexão)
// Aqui o navegador tenta "discar" para o servidor.
// ws://localhost:3000: É o endereço onde seu servidor está rodando. 
// O protocolo ws (WebSocket) abre um canal de mão dupla que fica aberto o tempo todo.

const log = document.getElementById("log");
const onlineSpan = document.getElementById("online");
// Escopo de Elementos do DOM (Interface) 
// Essas variáveis guardam as referências dos elementos que estão no seu arquivo HTML
// onlineSpan: Provavelmente um <span> onde o número de pessoas online será atualizado

socket.onopen = () => {
    addLog("Conectado ao servidor");
};
// Escopo de Eventos do Socket (Escutando o Servidor)
// socket.onopen => Dispara assim que o canal de comunicação é estabelecido com sucesso. Ele apenas avisa no seu log que a conexão deu certo.

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Como o servidor envia textos (strings) em formato JSON,
    //  o JSON.parse transforma isso de volta em um objeto JavaScript para podermos ler as propriedades:

    if (data.type === "online") {
        onlineSpan.textContent = data.count;
    }
    // Se data.type === "online": 
    // O código atualiza o número que aparece na tela com o valor que o servidor enviou (data.count).

    if (data.type === "echo") {
        addLog("Recebido: " + data.message);
    }
    // Se data.type === "echo": 
    // O código entende que é uma resposta à sua própria mensagem e a imprime na tela usando a função addLog.
};
// socket.onmessage (O Cérebro do Cliente)
// Este escopo lida com tudo o que o servidor envia para você.

function send() {
    const input = document.getElementById("input");

    addLog("Enviado: " + input.value);
    socket.send(input.value);

    input.value = "";
}
// Escopo de Interação do Usuário (send)
// Essa função deve ser chamada quando você clica em um botão "Enviar"
// 1. Pega o texto que você digitou no campo de entrada (input).
// 2. Usa o addLog para mostrar para você mesmo o que você escreveu.
// 3. socket.send(): Envia esse texto lá para o servidor (aquele que vai te devolver o "echo").
// 4. Limpa o campo de texto para a próxima mensagem.

function addLog(text) {
    const div = document. createElement("div");
    div.textContent = text;
    log.appendChild(div);
}
// Escopo de Utilidade (addLog)
// Uma função auxiliar simples para não ter que repetir código. 
// Ela cria um novo elemento de texto e "pendura" ele dentro da sua lista de logs na tela.

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-

// Resumo da Conversa:
/* 
    1. Navegador: "Servidor, quero conectar!" (new WebSocket)
    2. Servidor: "Beleza, agora temos X pessoas online." (type: "online")
    3. Navegador: Atualiza o número na tela.
    4. Você: Digita "Oi" e clica em enviar. (send())
    5. Servidor: "Oi (Eco)!" (type: "echo")
    6. Navegador: Mostra "Recebido: Oi" na tela.
*/
// 