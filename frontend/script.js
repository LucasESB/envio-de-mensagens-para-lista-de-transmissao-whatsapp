const baseUrlApi = "http://localhost:3000";
let apiConect = true;
const areaPrincipal = document.getElementById('areaPrincipal');

document.getElementById('form')
    .addEventListener('submit', enviar);

async function conectar() {
    const response = apiPost('/conectar');

    console.log(await response);
}

async function enviar(e) {
    e.preventDefault();
    if (!apiConect) {
        alert("Conecte-se com a api para poder relaizar a lista de trasnmissão.");
        return;
    }

    const mensagem = document.getElementById('mensagem');
    const planilha = document.getElementById('planilha');

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
        apiPost('/enviarMensagemLista', body);
    } catch (error) {
        console.log(error);
    }
}

function apiPost(url, body = null) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();

        request.addEventListener("load", (e) => resolve(request.response), false);

        request.open('POST', (baseUrlApi + url), true);
        request.setRequestHeader('Content-type', 'application/json');
        request.send(body ? JSON.stringify(body) : null);
    });
}

