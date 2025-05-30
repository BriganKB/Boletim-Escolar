// Aguarda o carregamento completo do DOM
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Seleciona elementos do DOM
        const form = document.getElementById('form-notas');
        const tabela = document.getElementById('corpo-tabela');
        const btnCalcular = document.getElementById('btn-calcular');
        const nomeUsuarioSpan = document.getElementById('nome-usuario');
        const btnLimparDados = document.getElementById('limpar-dados');
        const btnInserirNome = document.getElementById('btn-inserir-nome');
        const modalNome = document.getElementById('modal-nome');
        const inputNome = document.getElementById('input-nome');
        const btnSalvarNome = document.getElementById('btn-salvar-nome');
        const backgroundSquares = document.getElementById('background-squares');

        // Verifica se todos os elementos existem
        if (!form || !tabela || !btnCalcular || !nomeUsuarioSpan || !btnLimparDados || 
            !btnInserirNome || !modalNome || !inputNome || !btnSalvarNome || !backgroundSquares) {
            console.error('Erro: Um ou mais elementos do DOM não foram encontrados.');
            return;
        }

        let boletim = JSON.parse(localStorage.getItem('boletim')) || [];
        let editandoIndex = null;

        // Exibe o nome do usuário, se salvo
        const nomeUsuario = localStorage.getItem('nomeUsuario');
        if (nomeUsuario) {
            nomeUsuarioSpan.textContent = `de ${nomeUsuario}`;
        } else {
            modalNome.style.display = 'flex';
            inputNome.focus();
        }

        // Abre o modal
        btnInserirNome.addEventListener('click', function() {
            modalNome.style.display = 'flex';
            inputNome.focus();
        });

        // Salva o nome e rola para o formulário
        btnSalvarNome.addEventListener('click', function() {
            const nome = inputNome.value.trim();
            if (nome) {
                localStorage.setItem('nomeUsuario', nome);
                nomeUsuarioSpan.textContent = `de ${nome}`;
                modalNome.style.display = 'none';
                inputNome.value = '';
                document.getElementById('form-notas').scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('Por favor, insira um nome válido!');
            }
        });

        // Salva nome com Enter
        inputNome.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                btnSalvarNome.click();
            }
        });

        // Carrega tabela e quadrados
        atualizarTabela();

        // Limpa todos os dados
        btnLimparDados.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Tem certeza que deseja limpar todas as notas e o nome do usuário?')) {
                localStorage.removeItem('boletim');
                localStorage.removeItem('nomeUsuario');
                boletim = [];
                editandoIndex = null;
                form.reset();
                btnCalcular.textContent = 'Calcular Média';
                atualizarTabela();
                nomeUsuarioSpan.textContent = '';
                modalNome.style.display = 'flex';
                inputNome.focus();
            }
        });

        // Submissão do formulário
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const materia = document.getElementById('materia').value.trim();
            const p1 = parseFloat(document.getElementById('p1').value);
            const p2 = parseFloat(document.getElementById('p2').value);
            const sub = document.getElementById('sub').value ? parseFloat(document.getElementById('sub').value) : null;
            const af = document.getElementById('af').value ? parseFloat(document.getElementById('af').value) : null;

            // Validações
            if (!materia) {
                alert('Por favor, insira o nome da matéria!');
                return;
            }

            if (isNaN(p1) || isNaN(p2) || p1 < 0 || p1 > 10 || p2 < 0 || p2 > 10 || 
                (sub !== null && (sub < 0 || sub > 10)) || 
                (af !== null && (af < 0 || af > 10))) {
                alert('Por favor, insira notas válidas entre 0 e 10!');
                return;
            }

            // Calcula média
            let notas = [p1, p2];
            if (sub !== null && sub > Math.min(...notas)) {
                const menorNota = Math.min(...notas);
                const indexNota = notas.indexOf(menorNota);
                notas[indexNota] = sub;
            }

            const media = (notas[0] + notas[1]) / 2;
            const mediaFinal = af !== null ? (media * 0.6 + af * 0.4) : media;

            const item = {
                materia,
                p1,
                p2,
                sub,
                af,
                media: mediaFinal.toFixed(1),
                situacao: mediaFinal >= 6 ? 'Aprovado' : 'Reprovado'
            };

            if (editandoIndex !== null) {
                boletim[editandoIndex] = item;
                editandoIndex = null;
                btnCalcular.textContent = 'Calcular Média';
            } else {
                boletim.push(item);
            }

            localStorage.setItem('boletim', JSON.stringify(boletim));
            atualizarTabela();
            form.reset();
        });

        function atualizarTabela() {
            tabela.innerHTML = '';
            backgroundSquares.innerHTML = '';

            boletim.forEach((item, index) => {
                // Linha da tabela
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.materia}</td>
                    <td>${item.p1}</td>
                    <td>${item.p2}</td>
                    <td>${item.sub !== null ? item.sub : '-'}</td>
                    <td>${item.af !== null ? item.af : '-'}</td>
                    <td>${item.media}</td>
                    <td class="${item.situacao === 'Aprovado' ? 'aprovado' : 'reprovado'}">
                        ${item.situacao}
                    </td>
                    <td class="acoes-cell">
                        <button class="btn-editar" data-index="${index}">Editar</button>
                        <button class="btn-remover-btn" data-index="${index}">Remover</button>
                    </td>
                `;
                tabela.appendChild(row);

                // Quadrado flutuante
                const square = document.createElement('div');
                square.className = 'square';
                const opacity = 0.1 + (parseFloat(item.media) / 10) * 0.7;
                square.style.opacity = opacity;
                const duration = 5 + Math.random() * 5;
                square.style.animationDuration = `${duration}s`;
                square.style.setProperty('--rand-x1', Math.random() * 2 - 1);
                square.style.setProperty('--rand-y1', Math.random() * 2 - 1);
                square.style.setProperty('--rand-x2', Math.random() * 2 - 1);
                square.style.setProperty('--rand-y2', Math.random() * 2 - 1);
                square.style.setProperty('--rand-x3', Math.random() * 2 - 1);
                square.style.setProperty('--rand-y3', Math.random() * 2 - 1);
                square.style.left = `${Math.random() * 100}%`;
                square.style.top = `${Math.random() * 100}%`;
                backgroundSquares.appendChild(square);
            });

            // Associa eventos
            document.querySelectorAll('.btn-editar').forEach(button => {
                button.addEventListener('click', () => {
                    console.log('Editar:', button.dataset.index);
                    editarItem(Number(button.dataset.index));
                });
            });

            document.querySelectorAll('.btn-remover-btn').forEach(button => {
                button.addEventListener('click', () => {
                    console.log('Remover:', button.dataset.index);
                    removerItem(Number(button.dataset.index));
                });
            });
        }

        function editarItem(index) {
            if (typeof index !== 'number' || index < 0 || index >= boletim.length) {
                console.error('Índice inválido:', index);
                return;
            }
            const item = boletim[index];
            document.getElementById('materia').value = item.materia;
            document.getElementById('p1').value = item.p1;
            document.getElementById('p2').value = item.p2;
            document.getElementById('sub').value = item.sub !== null ? item.sub : '';
            document.getElementById('af').value = item.af !== null ? item.af : '';
            editandoIndex = index;
            btnCalcular.textContent = 'Atualizar Notas';
        }

        function removerItem(index) {
            if (typeof index !== 'number' || index < 0 || index >= boletim.length) {
                console.error('Índice inválido:', index);
                return;
            }
            if (confirm('Tem certeza que deseja remover esta matéria?')) {
                boletim.splice(index, 1);
                localStorage.setItem('boletim', JSON.stringify(boletim));
                console.log('Boletim:', JSON.parse(localStorage.getItem('boletim')));
                atualizarTabela();
                if (editandoIndex === index || editandoIndex !== null) {
                    editandoIndex = null;
                    form.reset();
                    btnCalcular.textContent = 'Calcular Média';
                }
            }
        }
    });
} else 
    console.error('Erro: Este código deve ser executado em um navegador.'); 