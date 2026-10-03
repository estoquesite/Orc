/**
 * NOVO SISTEMA DE ROTEIROS POR CALENDÁRIO
 * Permite montar roteiros dia a dia com wizard de etapas
 */

let roteirosCalendario = {
    roteiros: {}, // { 'YYYY-MM-DD': { etapas: [...], concluido: false, notas: '' } }
    etapaEmEdicao: null,
    transportsDisponiveis: ['✈️ Avião', '🚂 Trem', '🚗 Carro', '🚌 Ônibus', '🚶 A Pé']
};

function abrirCalendarioRoteiros() {
    const modal = document.getElementById('modal-calendario-roteiros');
    if (!modal) {
        console.error('Modal de calendário não encontrado');
        return;
    }
    
    construirCalendarioMensal();
    modal.classList.remove('hidden');
}

function fecharCalendarioRoteiros() {
    const modal = document.getElementById('modal-calendario-roteiros');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('wizard-etapas').classList.add('hidden');
    }
}

function construirCalendarioMensal() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasDoMes = ultimoDia.getDate();
    const diaInicial = primeiroDia.getDay();
    
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    let html = `
        <div class="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 space-y-3">
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-black text-slate-900 text-sm">📅 ${meses[mes]} ${ano}</h3>
                <button onclick="mudarMesCalendario(-1)" class="text-slate-600 hover:text-slate-900 font-bold">◀</button>
                <button onclick="mudarMesCalendario(1)" class="text-slate-600 hover:text-slate-900 font-bold">▶</button>
            </div>
            
            <div class="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 mb-2">
                <div>Dom</div>
                <div>Seg</div>
                <div>Ter</div>
                <div>Qua</div>
                <div>Qui</div>
                <div>Sex</div>
                <div>Sab</div>
            </div>
            
            <div class="grid grid-cols-7 gap-1">
    `;
    
    // Dias vazios antes do 1º
    for (let i = 0; i < diaInicial; i++) {
        html += '<div class="p-2 rounded-xl bg-slate-50"></div>';
    }
    
    // Dias do mês
    for (let dia = 1; dia <= diasDoMes; dia++) {
        const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const temRoteiro = roteirosCalendario.roteiros[dataStr];
        const ehHoje = new Date().toDateString() === new Date(ano, mes, dia).toDateString();
        
        let classe = 'p-2 rounded-xl cursor-pointer transition hover:scale-105 text-xs font-bold text-center ';
        
        if (temRoteiro) {
            classe += temRoteiro.concluido 
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-indigo-100 text-indigo-900 border border-indigo-300';
        } else {
            classe += ehHoje
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-white text-slate-700 border border-slate-200';
        }
        
        const badge = temRoteiro ? ` <span class="text-[10px] block">${temRoteiro.etapas.length} etapas</span>` : '';
        html += `<button onclick="selecionarDiaRoteiro('${dataStr}')" class="${classe}">${dia}${badge}</button>`;
    }
    
    html += '</div></div>';
    
    document.getElementById('calendario-container').innerHTML = html;
}

function selecionarDiaRoteiro(dataStr) {
    // Armazena a data selecionada
    window.dataRoteiroselecionada = dataStr;
    
    // Inicializa roteiro se não existir
    if (!roteirosCalendario.roteiros[dataStr]) {
        roteirosCalendario.roteiros[dataStr] = {
            etapas: [],
            concluido: false,
            notas: ''
        };
    }
    
    // Abre o wizard
    document.getElementById('calendario-container').classList.add('hidden');
    document.getElementById('wizard-etapas').classList.remove('hidden');
    
    renderizarWizardEtapas(dataStr);
}

function renderizarWizardEtapas(dataStr) {
    const roteiro = roteirosCalendario.roteiros[dataStr];
    
    let html = `
        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-200 space-y-4">
            <div class="flex justify-between items-center border-b pb-2">
                <h3 class="font-black text-slate-900 flex items-center gap-2">
                    <span>📍</span> Montar Roteiro - ${dataStr}
                </h3>
                <button onclick="voltarAoCalendario()" class="text-slate-500 hover:text-slate-700 font-bold">✕</button>
            </div>
            
            <!-- PRÉVIA VISUAL LINEAR DAS ETAPAS -->
            <div class="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <span class="text-[10px] font-bold text-slate-600 uppercase block">Percurso Planejado</span>
    `;
    
    if (roteiro.etapas.length === 0) {
        html += '<p class="text-xs text-slate-500 italic">Nenhuma etapa adicionada. Comece tocando o botão abaixo.</p>';
    } else {
        roteiro.etapas.forEach((etapa, idx) => {
            html += `
                <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 flex justify-between items-center gap-2">
                    <div class="flex-1 min-w-0">
                        <div class="text-xs font-bold text-slate-700">
                            <span>${idx + 1}.</span> 
                            <span>${etapa.origem}</span>
                            <span class="mx-1">${etapa.transporte}</span>
                            <span>${etapa.destino}</span>
                        </div>
                        <div class="text-[10px] text-slate-500">
                            ${etapa.mapLink ? '🗺️ Maps vinculado' : ''}
                            ${etapa.observacoes ? ` | 📝 ${etapa.observacoes.substring(0, 30)}...` : ''}
                        </div>
                    </div>
                    <button onclick="editarEtapa(${idx})" class="text-indigo-600 hover:text-indigo-900 text-lg shrink-0">✏️</button>
                    <button onclick="removerEtapa(${idx})" class="text-red-600 hover:text-red-900 text-lg shrink-0">🗑️</button>
                </div>
            `;
        });
    }
    
    html += `
            </div>
            
            <!-- FORMULÁRIO PARA ADICIONAR NOVA ETAPA -->
            <div class="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <div class="text-[10px] font-bold text-slate-600 uppercase">➕ Adicionar Etapa</div>
                
                <!-- PASSO 1: ORIGEM -->
                <div>
                    <label class="text-xs font-bold text-slate-600 block mb-1">De Onde?</label>
                    <select id="input-origem" class="w-full p-2 bg-indigo-50 border border-indigo-300 rounded-lg text-xs font-bold outline-none">
                        <option value="">Selecionar origem...</option>
                        ${dadosApp.origensCadastrados.map(o => `<option value="${o}">${o}</option>`).join('')}
                        <option value="custom">+ Adicionar nova origem</option>
                    </select>
                </div>
                
                <!-- PASSO 2: DESTINO -->
                <div>
                    <label class="text-xs font-bold text-slate-600 block mb-1">Para Onde?</label>
                    <select id="input-destino" class="w-full p-2 bg-purple-50 border border-purple-300 rounded-lg text-xs font-bold outline-none">
                        <option value="">Selecionar destino...</option>
                        ${dadosApp.destinosCadastradosLocais.map(d => `<option value="${d}">${d}</option>`).join('')}
                        <option value="custom">+ Adicionar novo destino</option>
                    </select>
                </div>
                
                <!-- PASSO 3: LINK DO MAPS -->
                <div>
                    <label class="text-xs font-bold text-slate-600 block mb-1">Link do Google Maps (opcional)</label>
                    <input type="url" id="input-maps-link" placeholder="https://maps.google.com/..." 
                           class="w-full p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold outline-none">
                </div>
                
                <!-- PASSO 4: TRANSPORTE -->
                <div>
                    <label class="text-xs font-bold text-slate-600 block mb-1">Tipo de Transporte</label>
                    <div class="grid grid-cols-5 gap-1">
                        ${roteirosCalendario.transportsDisponiveis.map(t => {
                            const icon = t.split(' ')[0];
                            const nome = t.split(' ')[1];
                            return `<button type="button" onclick="selecionarTransporte('${t}')" 
                                           id="btn-trans-${nome}"
                                           class="p-2 rounded-lg border-2 border-slate-200 text-xs font-bold hover:border-indigo-600 transition text-center" title="${nome}">
                                    ${icon}
                                </button>`;
                        }).join('')}
                    </div>
                    <input type="hidden" id="input-transporte" value="">
                </div>
                
                <!-- OBSERVAÇÕES E DETALHES RECOLHIDOS -->
                <details class="text-xs">
                    <summary class="font-bold text-slate-600 cursor-pointer hover:text-indigo-600">📋 Detalhes (transporte, valores, fotos)</summary>
                    <div class="mt-2 space-y-2 bg-slate-50 p-2 rounded-lg">
                        <div>
                            <label class="text-[10px] font-bold text-slate-600 block mb-1">Observações</label>
                            <textarea id="input-observacoes" rows="2" placeholder="Horário, comentários..." 
                                      class="w-full p-1 bg-white border border-slate-300 rounded-lg text-xs outline-none"></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="text-[10px] font-bold text-slate-600 block mb-1">Valor (opcional)</label>
                                <input type="number" id="input-valor" placeholder="0" 
                                       class="w-full p-1 bg-white border border-slate-300 rounded-lg text-xs outline-none">
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-600 block mb-1">Moeda</label>
                                <select id="input-moeda-etapa" class="w-full p-1 bg-white border border-slate-300 rounded-lg text-xs outline-none">
                                    <option value="EUR">€</option>
                                    <option value="CHF">CHF</option>
                                    <option value="BRL">R$</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </details>
                
                <button type="button" onclick="adicionarEtapa()" 
                        class="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg font-bold text-xs transition shadow-sm">
                    ➕ Confirmar Parada
                </button>
            </div>
            
            <!-- RODAPÉ: AÇÕES GERAIS -->
            <div class="flex gap-2">
                <button onclick="voltarAoCalendario()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg font-bold text-xs transition">
                    ◀ Voltar
                </button>
                <button onclick="enviarRoteiroDefinitivo('${dataStr}')" 
                        class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg font-bold text-xs transition">
                    ✓ Enviar para Roteiro
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('wizard-etapas').innerHTML = html;
}

function selecionarTransporte(transporte) {
    document.getElementById('input-transporte').value = transporte;
    
    // Destaca o botão selecionado
    document.querySelectorAll('[id^="btn-trans-"]').forEach(btn => {
        btn.classList.remove('border-indigo-600', 'bg-indigo-50');
        btn.classList.add('border-slate-200');
    });
    
    const nome = transporte.split(' ')[1];
    const btn = document.getElementById(`btn-trans-${nome}`);
    if (btn) {
        btn.classList.add('border-indigo-600', 'bg-indigo-50');
    }
}

function adicionarEtapa() {
    const origem = document.getElementById('input-origem').value?.trim();
    const destino = document.getElementById('input-destino').value?.trim();
    const transporte = document.getElementById('input-transporte').value?.trim();
    const mapLink = document.getElementById('input-maps-link').value?.trim();
    const observacoes = document.getElementById('input-observacoes').value?.trim();
    const valor = document.getElementById('input-valor').value?.trim();
    const moeda = document.getElementById('input-moeda-etapa').value;
    
    if (!origem || !destino || !transporte) {
        mostrarToast('Preencha origem, destino e transporte', 'erro');
        return;
    }
    
    const etapa = {
        id: Date.now(),
        origem,
        destino,
        transporte,
        mapLink: mapLink || null,
        observacoes: observacoes || '',
        valor: valor ? parseFloat(valor) : 0,
        moeda,
        criado: new Date().toISOString()
    };
    
    const dataStr = window.dataRoteiroselecionada;
    roteirosCalendario.roteiros[dataStr].etapas.push(etapa);
    
    // Limpar formulário
    document.getElementById('input-origem').value = '';
    document.getElementById('input-destino').value = '';
    document.getElementById('input-transporte').value = '';
    document.getElementById('input-maps-link').value = '';
    document.getElementById('input-observacoes').value = '';
    document.getElementById('input-valor').value = '';
    
    // Renderizar novamente
    renderizarWizardEtapas(dataStr);
    mostrarToast('✓ Parada adicionada ao roteiro!', 'sucesso');
}

function removerEtapa(idx) {
    const dataStr = window.dataRoteiroselecionada;
    roteirosCalendario.roteiros[dataStr].etapas.splice(idx, 1);
    renderizarWizardEtapas(dataStr);
}

function editarEtapa(idx) {
    const etapa = roteirosCalendario.roteiros[window.dataRoteiroselecionada].etapas[idx];
    document.getElementById('input-origem').value = etapa.origem;
    document.getElementById('input-destino').value = etapa.destino;
    document.getElementById('input-transporte').value = etapa.transporte;
    document.getElementById('input-maps-link').value = etapa.mapLink || '';
    document.getElementById('input-observacoes').value = etapa.observacoes;
    document.getElementById('input-valor').value = etapa.valor;
    document.getElementById('input-moeda-etapa').value = etapa.moeda;
    
    // Destaca o botão de transporte
    const nome = etapa.transporte.split(' ')[1];
    const btn = document.getElementById(`btn-trans-${nome}`);
    if (btn) {
        btn.classList.add('border-indigo-600', 'bg-indigo-50');
    }
    
    // Scroll até o formulário
    document.getElementById('wizard-etapas').scrollIntoView({ behavior: 'smooth' });
}

function voltarAoCalendario() {
    document.getElementById('calendario-container').classList.remove('hidden');
    document.getElementById('wizard-etapas').classList.add('hidden');
    construirCalendarioMensal();
}

function enviarRoteiroDefinitivo(dataStr) {
    const roteiro = roteirosCalendario.roteiros[dataStr];
    
    if (roteiro.etapas.length === 0) {
        mostrarToast('Adicione pelo menos uma etapa ao roteiro', 'erro');
        return;
    }
    
    // Converter etapas do calendário para formato do itinerário
    const blocoItinerario = {
        id: Date.now(),
        data: dataStr,
        destino: roteiro.etapas[roteiro.etapas.length - 1].destino, // Destino final
        etapas: roteiro.etapas,
        concluido: false,
        trancado: false,
        cor: obterCorPorDestino(roteiro.etapas[roteiro.etapas.length - 1].destino)
    };
    
    // Adicionar ao itinerário da app
    if (!dadosApp.itinerario) dadosApp.itinerario = [];
    dadosApp.itinerario.push(blocoItinerario);
    
    roteiro.concluido = true;
    
    salvarStorage();
    atualizarTudo();
    
    mostrarToast(`✓ Roteiro de ${dataStr} criado com sucesso! 📍`, 'sucesso');
    fecharCalendarioRoteiros();
}

function obterCorPorDestino(destino) {
    for (let [dest, cor] of Object.entries(dadosApp.coresDestinos || {})) {
        if (destino.includes(dest)) return cor;
    }
    return '#6366f1';
}

function mudarMesCalendario(direcao) {
    // Esta função seria expandida para navegar entre meses
    construirCalendarioMensal();
}
