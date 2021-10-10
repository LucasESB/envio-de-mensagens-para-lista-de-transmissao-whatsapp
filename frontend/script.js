let apiConect = false;
const baseUrlApi = "http://localhost:3000";
const botConectar = document.getElementById('botConectar');
const botEnviar = document.getElementById('botEnviar');
const divQrCode = document.getElementById('qrcode');
const imgQrCode = document.createElement('img');
let buscarImgQrCode = true;

document.getElementById('form')
    .addEventListener('submit', enviar);

async function conectar() {
    habilitarDesabilitarBotConectar(true);

    try {
        const response = apiPost('/conectar');
        getImgQrCode();
        apiConect = await response == 'true';

        botEnviar.style.backgroundColor = apiConect ? '#3880ff' : '#eb445a';
    } catch (error) {
        alert("Ocorreu um erro ao tentar comunicar com o servidor");
    } finally {
        buscarImgQrCode = false;
        habilitarDesabilitarBotConectar(false);
    }
}

function habilitarDesabilitarBotConectar(habilitar) {
    if (habilitar) {
        botConectar.setAttribute('disabled', 'disabled');
        botConectar.style.backgroundColor = '#b7d5ac';
    } else {
        botConectar.removeAttribute('disabled');
        botConectar.style.backgroundColor = '#25D366';
        divQrCode.style.display = 'none';
    }
}

async function getImgQrCode() {
    divQrCode.style.display = 'flex';

    while (buscarImgQrCode) {
        try {
            imgQrCode.setAttribute('src', `${baseUrlApi}/qrCode.png`);
            divQrCode.appendChild(imgQrCode);

            await sleep(2);
        } catch (error) {
            imgQrCode.remove();
        }
    }

    divQrCode.style.display = 'none';
}

async function enviar(e) {
    e.preventDefault();

    const mensagem = document.getElementById('mensagem');
    const planilha = document.getElementById('planilha');

    if (!apiConect) {
        alert("Conecte-se com a api para poder realizar a lista de trasnmissão.");
        return;
    } else if (!mensagem.value || planilha.files.length == 0) {
        alert('Os campos "Mensagem" e "Planilha" são de preenchimento obrigatorio!');
        return;
    }

    const rows = await readXlsxFile(planilha.files[0]);
    const listTrasmissao = [];

    rows.forEach(linha => {
        linha.forEach(coluna => {
            listTrasmissao.push(coluna);
        })
    })

    const body = {
        mensagem: mensagem.value,
        listTransmissao: listTrasmissao
    }

    try {
        const response = await apiPost('/enviarMensagemLista', body);
        console.log(response);
    } catch (error) {
        console.log(error);
    } finally {
        apiConect = false;
    }
}

function apiGet(url) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();

        request.addEventListener("load", (e) => resolve(request.response), false);
        request.addEventListener("error", (e) => reject(e), false);

        request.open('GET', (baseUrlApi + url), true);
        request.send();
    });
}

function apiPost(url, body = null) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();

        request.addEventListener("load", (e) => resolve(request.response), false);
        request.addEventListener("error", (e) => reject(e), false);

        request.open('POST', (baseUrlApi + url), true);
        request.setRequestHeader('Content-type', 'application/json');
        request.send(body ? JSON.stringify(body) : null);
    });
}

/**
 * Informe o delay em segundos
 * 
 * @param {*} delay 
 * @returns 
 */
function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, (delay * 1000)));
}
