const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/conectar', async (req, res) => {
    try {
        const result = await iniciarConexao();
        res.send(result);
    } catch (error) {
        res.send(false);
    }

    fs.unlink('./public/qrCode.png', (err) => { });
});

app.get('/qrcode', (req, res) => {
    var options = {
        root: path.join(__dirname)
    };

    res.sendFile('/public/qrCode.png', options, (err) => {
        if (err) return res.send(null);
    });
});

app.post('/enviarMensagemLista', async (req, res) => {
    if (!await isConectado()) {
        return res.status(400).send("Conecte-se com a api antes de tentar o envio de mensagens.");
    }

    const body = { ...req.body };

    console.log(body);

    if (!body.listTransmissao || !body.mensagem) {
        console.log("Dados nulos");
        return res.status(400).send("Dados invalidos");
    }
    else if (!Array.isArray(body.listTransmissao) || typeof body.mensagem != "string") {
        console.log("Dados com tipos invalidos");
        return res.status(400).send("Dados invalidos");
    }
    try {
        const result = await enviarMensagemParaListTransmissao(body.listTransmissao, body.mensagem);
        res.json(result);
    } catch (error) {
        res.status(400);
    }
});

app.listen(3000, () => {
    console.log("\x1b[42m\x1b[30m", "Servidor: online, Porta: 3000", "\x1b[0m")
});

/**
 * Variavel que armazena a conexão com o WhatsApp
 */
let cliente = null;

/**
 * Cria uma conexão com o whatsapp, neste momento aparecerá um qr code no cmd para que ele possa se conectar
 */
async function iniciarConexao() {
    try {
        cliente = await venom.create(
            'session',
            (base64Qr, asciiQR, attempts, urlCode) => {
                console.log(asciiQR); // Optional to log the QR in the terminal
                var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                    response = {};

                if (matches.length !== 3) {
                    return new Error('Invalid input string');
                }
                response.type = matches[1];
                response.data = new Buffer.from(matches[2], 'base64');

                var imageBuffer = response;
                fs.writeFile(
                    './public/qrCode.png',
                    imageBuffer['data'],
                    'binary',
                    function (err) {
                        if (err != null) {
                            console.log(err);
                        }
                    }
                );
            },
            undefined,
            { logQR: false }
        );

        return isConectado();
    } catch (error) {
        return false;
    }
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
        throw 'Parametro "Mensagem" invalido';
    }

    const listNumerosNaoEnviado = [];
    let concluido = false;

    for (let i = 0; i < listTransmissao.length; i++) {
        concluido = await enviarMensagem(listTransmissao[i], mensagem);

        if (!concluido) {
            listNumerosNaoEnviado.push(listTransmissao[i]);
        }

        await sleep(delay);
    }

    await cliente.killServiceWorker();
    await cliente.logout();
    fs.unlink('./tokens/session.data.json', (err) => {});

    return { listNumerosNaoEnviado: listNumerosNaoEnviado };
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
        if (!await isConectado()) {
            return false;
        }

        const result = await cliente.sendText(`55${numero}@c.us`, mensagem);
        return result && result.status == 'OK';
    } catch (error) {
        return false;
    }
}

async function isConectado() {
    if (!cliente) {
        return false;
    }
    return await cliente.isConnected();
}

function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, (delay * 1000)));
}