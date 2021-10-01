const venom = require('venom-bot');

/**
 * Variavel que armazena a conexão com o WhatsApp
 */
let cliente = null;

iniciarConexao();

async function iniciarConexao() {
    try {
        cliente = await venom.create();
        await teste();
    } catch (error) {
        throw error;
    }
}

async function teste() {
    //TODO Pegar lista de contatos de uma planilha

    // Preencha esse array com uma lista de numeros com o DD ex: 629999999
    const listNumeros = [];

    enviarMensagemParaListTransmissao(listNumeros, '👋 Teste de envio de Mensagem!')
}

/**
 * Metodo responsavel por enviar mensagem para lista de transmissão
 * 
 * @param {*} listTransmissao Lista com numeros de telefone 
 * @param {*} mensagem Mensagem a ser enviada 
 * @param {*} delay Informe o tempo de delay em Segundos
 */
async function enviarMensagemParaListTransmissao(listTransmissao = [], mensagem = null, delay = 0) {

    if (!mensagem || typeof mensagem != "string") {
        throw "Função enviarMensagemParaListTransmissao parametro Mensagem invalido";
    }

    const listNumerosNaoEnviado = [];
    let contador = 0;
    let concluido = false;

    for (let i = 0; i < listTransmissao.length; i++) {
        console.log(`Enviando.... ${++contador}/${listTransmissao.length}`);
        concluido = await enviarMensagem(listTransmissao[i], mensagem);

        if (!concluido) {
            listNumerosNaoEnviado.push(listTransmissao[i]);
        }

        await sleep(delay);
    }

    console.log(`Enviados: ${listTransmissao.length - listNumerosNaoEnviado.length} Erros: ${listNumerosNaoEnviado.length} \n`);

    if (listNumerosNaoEnviado.length > 0) {
        console.log("Lista de numeros não enviados: ")
        listNumerosNaoEnviado.forEach(numero => console.log(numero));
    }
}

/**
 * Metodo responsavel pelo envio da mensagem para um numero especifico 
 * 
 * @param {*} numero Numero contento o DD
 * @param {*} mensagem Mensagem a ser enviada 
 * @returns 
 */
async function enviarMensagem(numero, mensagem) {
    try {
        const result = await cliente.sendText(`55${numero}@c.us`, mensagem);
        return result && result.status == 'OK';
    } catch (error) {
        return false;
    }
}

function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, (delay * 1000)));
}