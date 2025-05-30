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
        const folderSelect = document.getElementById('folder-select');
        const btnCreateFolder = document.getElementById('btn-create-folder');
        const modalFolder = document.getElementById('modal-folder');
        const inputFolder = document.getElementById('input-folder');
        const btnSalvarFolder = document.getElementById('btn-salvar-folder');
        const btnScheduleEvaluation = document.getElementById('btn-schedule-evaluation');
        const modalEvaluation = document.getElementById('modal-evaluation');
        const inputEvaluationName = document.getElementById('input-evaluation-name');
        const inputEvaluationDate = document.getElementById('input-evaluation-date');
        const btnSalvarEvaluation = document.getElementById('btn-salvar-evaluation');
        const calendarList = document.getElementById('calendar-list');
        const calendarGrid = document.getElementById('calendar-grid');
        const calendarMonth = document.getElementById('calendar-month');
        const btnPrevMonth = document.getElementById('btn-prev-month');
        const btnNextMonth = document.getElementById('btn-next-month');
        const btnReminder = document.getElementById('btn-reminder');
        const modalReminder = document.getElementById('modal-reminder');
        const inputReminder = document.getElementById('input-reminder');
        const btnSalvarReminder = document.getElementById('btn-salvar-reminder');
        const reminderList = document.getElementById('reminder-list');

        // Verifica se todos os elementos existem
        if (!form || !tabela || !btnCalcular || !nomeUsuarioSpan || !btnLimparDados || 
            !btnInserirNome || !modalNome || !inputNome || !btnSalvarNome || 
            !backgroundSquares || !folderSelect || !btnCreateFolder || !modalFolder || 
            !inputFolder || !btnSalvarFolder || !btnScheduleEvaluation || 
            !modalEvaluation || !inputEvaluationName || !inputEvaluationDate || 
            !btnSalvarEvaluation || !calendarList || !calendarGrid || !calendarMonth || 
            !btnPrevMonth || !btnNextMonth || !btnReminder || !modalReminder || 
            !inputReminder || !btnSalvarReminder || !reminderList) {
            console.error('Erro: Um ou mais elementos do DOM não foram encontrados.');
            return;
        }

        // Inicializa dados
        let data = JSON.parse(localStorage.getItem('appData')) || {
            folders: ['Padrão'],
            grades: { 'Padrão': [] },
            evaluations: [],
            reminders: []
        };
        let currentFolder = data.folders[0];
        let editandoIndex = null;
        let currentDate = new Date();

        // Exibe o nome do usuário
        const nomeUsuario = localStorage.getItem('nomeUsuario');
        if (nomeUsuario) {
            nomeUsuarioSpan.textContent = ` ${nomeUsuario}`;
        } else {
            modalNome.style.display = 'flex';
            inputNome.focus();
        }

        // Popula o seletor de pastas
        function updateFolderSelect() {
            folderSelect.innerHTML = '';
            data.folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder;
                option.textContent = folder;
                if (folder === currentFolder) option.selected = true;
                folderSelect.appendChild(option);
            });
        }

        // Atualiza tabela e quadrados
        function atualizarTabela() {
            tabela.innerHTML = '';
            backgroundSquares.innerHTML = '';

            const grades = data.grades[currentFolder] || [];
            grades.forEach((item, index) => {
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

            document.querySelectorAll('.btn-editar').forEach(button => {
                button.addEventListener('click', () => {
                    editarItem(Number(button.dataset.index));
                });
            });

            document.querySelectorAll('.btn-remover-btn').forEach(button => {
                button.addEventListener('click', () => {
                    removerItem(Number(button.dataset.index));
                });
            });

            atualizarCalendario();
        }

        // Atualiza calendário e lista de avaliações
        function atualizarCalendario() {
            calendarList.innerHTML = '';
            calendarGrid.innerHTML = '';

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            calendarMonth.textContent = `${new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`;

            const firstDay = new Date(year, month, 1).getDay();
            const lastDay = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                calendarGrid.appendChild(emptyDay);
            }

            for (let day = 1; day <= lastDay; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day';
                dayDiv.textContent = day;
                dayDiv.dataset.date = dateStr;

                const events = data.evaluations.filter(e => e.date === dateStr);
                if (events.length > 0) {
                    dayDiv.className += ' event';
                }

                dayDiv.addEventListener('click', () => {
                    inputEvaluationDate.value = dateStr;
                    modalEvaluation.style.display = 'flex';
                    inputEvaluationName.focus();
                    calendarList.innerHTML = '';
                    events.forEach((event, index) => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            ${event.name} - ${new Date(event.date).toLocaleDateString('pt-BR')}
                            <button class="btn-remover-btn" data-index="${index}">Remover</button>
                        `;
                        calendarList.appendChild(li);
                        li.querySelector('.btn-remover-btn').addEventListener('click', () => {
                            data.evaluations.splice(index, 1);
                            localStorage.setItem('appData', JSON.stringify(data));
                            atualizarCalendario();
                        });
                    });
                });
                calendarGrid.appendChild(dayDiv);
            }
        }

        // Atualiza lembretes
        function atualizarLembretes() {
            reminderList.innerHTML = '';
            data.reminders.forEach((reminder, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${reminder.text} - ${new Date(reminder.timestamp).toLocaleString('pt-BR')}
                    <button class="btn-remover-btn" data-index="${index}">Remover</button>
                `;
                reminderList.appendChild(li);
                li.querySelector('.btn-remover-btn').addEventListener('click', () => {
                    data.reminders.splice(index, 1);
                    localStorage.setItem('appData', JSON.stringify(data));
                    atualizarLembretes();
                });
            });
        }

        // Carrega dados iniciais
        updateFolderSelect();
        atualizarTabela();
        atualizarCalendario();
        atualizarLembretes();

        // Navegação do calendário
        btnPrevMonth.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            atualizarCalendario();
        });

        btnNextMonth.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            atualizarCalendario();
        });

        // Abre modal de nome
        btnInserirNome.addEventListener('click', function() {
            modalNome.style.display = 'flex';
            inputNome.focus();
        });

        // Salva nome
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

        // Abre modal de pasta
        btnCreateFolder.addEventListener('click', function() {
            modalFolder.style.display = 'flex';
            inputFolder.focus();
        });

        // Salva pasta
        btnSalvarFolder.addEventListener('click', function() {
            const folderName = inputFolder.value.trim();
            if (folderName && !data.folders.includes(folderName)) {
                data.folders.push(folderName);
                data.grades[folderName] = [];
                currentFolder = folderName;
                localStorage.setItem('appData', JSON.stringify(data));
                updateFolderSelect();
                atualizarTabela();
                modalFolder.style.display = 'none';
                inputFolder.value = '';
            } else {
                alert('Por favor, insira um nome de pasta válido e único!');
            }
        });

        // Salva pasta com Enter
        inputFolder.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                btnSalvarFolder.click();
            }
        });

        // Muda pasta ativa
        folderSelect.addEventListener('change', function() {
            currentFolder = folderSelect.value;
            atualizarTabela();
        });

        // Abre modal de avaliação
        btnScheduleEvaluation.addEventListener('click', function() {
            modalEvaluation.style.display = 'flex';
            inputEvaluationName.focus();
        });

        // Salva avaliação
        btnSalvarEvaluation.addEventListener('click', function() {
            const evalName = inputEvaluationName.value.trim();
            const evalDate = inputEvaluationDate.value;
            if (evalName && evalDate) {
                data.evaluations.push({ name: evalName, date: evalDate });
                localStorage.setItem('appData', JSON.stringify(data));
                atualizarCalendario();
                modalEvaluation.style.display = 'none';
                inputEvaluationName.value = '';
                inputEvaluationDate.value = '';
            } else {
                alert('Por favor, insira o nome e a data da avaliação!');
            }
        });

        // Salva avaliação com Enter
        inputEvaluationName.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                btnSalvarEvaluation.click();
            }
        });

        // Abre modal de lembrete
        btnReminder.addEventListener('click', function() {
            modalReminder.style.display = 'flex';
            inputReminder.focus();
        });

        // Salva lembrete
        btnSalvarReminder.addEventListener('click', function() {
            const reminderText = inputReminder.value.trim();
            if (reminderText) {
                data.reminders.push({ text: reminderText, timestamp: new Date().toISOString() });
                localStorage.setItem('appData', JSON.stringify(data));
                atualizarLembretes();
                modalReminder.style.display = 'none';
                inputReminder.value = '';
            } else {
                alert('Por favor, insira um lembrete válido!');
            }
        });

        // Salva lembrete com Enter
        inputReminder.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                btnSalvarReminder.click();
            }
        });

        // Limpa todos os dados
        btnLimparDados.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Tem certeza que deseja limpar todas as notas, pastas, avaliações e lembretes?')) {
                localStorage.removeItem('appData');
                localStorage.removeItem('nomeUsuario');
                data = { folders: ['Padrão'], grades: { 'Padrão': [] }, evaluations: [], reminders: [] };
                currentFolder = 'Padrão';
                editandoIndex = null;
                form.reset();
                btnCalcular.textContent = 'Calcular Média';
                updateFolderSelect();
                atualizarTabela();
                atualizarCalendario();
                atualizarLembretes();
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
                data.grades[currentFolder][editandoIndex] = item;
                editandoIndex = null;
                btnCalcular.textContent = 'Calcular Média';
            } else {
                if (!data.grades[currentFolder]) data.grades[currentFolder] = [];
                data.grades[currentFolder].push(item);
            }

            localStorage.setItem('appData', JSON.stringify(data));
            atualizarTabela();
            form.reset();
        });

        function editarItem(index) {
            if (typeof index !== 'number' || index < 0 || index >= data.grades[currentFolder].length) {
                console.error('Índice inválido:', index);
                return;
            }
            const item = data.grades[currentFolder][index];
            document.getElementById('materia').value = item.materia;
            document.getElementById('p1').value = item.p1;
            document.getElementById('p2').value = item.p2;
            document.getElementById('sub').value = item.sub !== null ? item.sub : '';
            document.getElementById('af').value = item.af !== null ? item.af : '';
            editandoIndex = index;
            btnCalcular.textContent = 'Atualizar Notas';
        }

        function removerItem(index) {
            if (typeof index !== 'number' || index < 0 || index >= data.grades[currentFolder].length) {
                console.error('Índice inválido:', index);
                return;
            }
            if (confirm('Tem certeza que deseja remover esta matéria?')) {
                data.grades[currentFolder].splice(index, 1);
                localStorage.setItem('appData', JSON.stringify(data));
                atualizarTabela();
                if (editandoIndex === index || editandoIndex !== null) {
                    editandoIndex = null;
                    form.reset();
                    btnCalcular.textContent = 'Calcular Média';
                }
            }
        }
    });
} else {
    console.error('Erro: Este código deve ser executado em um navegador.');
}