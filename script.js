document.addEventListener('DOMContentLoaded', () => {
    const cepInput = document.getElementById('cep');
    const consultarButton = document.getElementById('consultar');
    const armazenarButton = document.getElementById('armazenar');
    const registrosTable = document.getElementById('registros').getElementsByTagName('tbody')[0];

    carregarRegistros();

    consultarButton.addEventListener('click', () => {
        const cep = cepInput.value;
        consultarCEP(cep);
    });

    armazenarButton.addEventListener('click', () => {
        const registros = obterRegistrosArmazenados();
        const cep = cepInput.value;

        if (cep.trim() === '') {
            alert('Por favor, insira um CEP antes de armazenar.');
            return;
        }

        if (registros.some(registro => registro.cep === cep)) {
            alert('Este CEP já foi armazenado.');
        } else {
            consultarCEP(cep, () => {
                const registro = obterRegistroCEP(cep);
                adicionarRegistro(registro);
            });
        }
    });

    function consultarCEP(cep, callback) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert("CEP não encontrado.");
                } else {
                    const registro = {
                        cep: data.cep,
                        cidade: data.localidade,
                        bairro: data.bairro,
                        estado: data.uf
                    };
                    callback(registro);
                }
            })
            .catch(error => {
                console.error("Erro na consulta ao ViaCEP:", error);
                alert("Ocorreu um erro na consulta. Verifique a conexão com a internet e tente novamente.");
            });
    }

    function adicionarRegistro(registro) {
        const registros = obterRegistrosArmazenados();
        registros.push(registro);
        localStorage.setItem('registros', JSON.stringify(registros));
        carregarRegistros();
    }

    function obterRegistrosArmazenados() {
        const registros = JSON.parse(localStorage.getItem('registros')) || [];
        return registros;
    }

    function obterRegistroCEP(cep) {
        return obterRegistrosArmazenados().find(registro => registro.cep === cep);
    }

    function carregarRegistros() {
        registrosTable.innerHTML = '';
        const registros = obterRegistrosArmazenados();
        registros.forEach((registro, index) => {
            const row = registrosTable.insertRow();
            row.innerHTML = `
                <td>${registro.cep}</td>
                <td>${registro.cidade}</td>
                <td>${registro.bairro}</td>
                <td>${registro.estado}</td>
            `;
        });
    }
});
