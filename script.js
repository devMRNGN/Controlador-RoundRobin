class Processo {
  constructor(nome, tempoExecucao) {
    this.nome = nome;
    this.tempoExecucao = tempoExecucao;
    this.tempoRestante = tempoExecucao;
    this.espera = 0;
    this.turnaround = 0;
  }
}

function roundRobin(processos, quantum) {
  const historicoProcessos = document.querySelector(".inserir-historico");
  
  processos.forEach(processo => {
    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `
        <td>${processo.nome}</td>
        <td>${processo.tempoRestante}</td>
        <td>${processo.espera}</td>
        <td>${processo.turnaround}</td>
    `;
    historicoProcessos.appendChild(novaLinha);
  });

  let tempoAtual = 0;
  let fila = [...processos];
  let tempoTotalEspera = 0;
  let tempoTotalTurnaround = 0;

  while (fila.length > 0) {
    const processo = fila.shift();

    const tempoExecutado = Math.min(quantum, processo.tempoRestante);
    processo.tempoRestante -= tempoExecutado;
    tempoAtual += tempoExecutado;

    let tempoEsperaAtual = tempoAtual - (processo.tempoExecucao - processo.tempoRestante);

    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `
        <td>${processo.nome}</td>
        <td>${processo.tempoRestante === 0 ? `${processo.nome} finalizado!` : processo.tempoRestante}</td>
        <td>${tempoEsperaAtual}</td>
        <td>${tempoAtual}</td>
    `;
    historicoProcessos.appendChild(novaLinha);

    for (const outroProcesso of fila) {
      outroProcesso.espera += tempoExecutado;
    }

    if (processo.tempoRestante > 0) {
      fila.push(processo);
    } else {
      processo.turnaround = tempoAtual;
      tempoTotalEspera += processo.espera;
      tempoTotalTurnaround += processo.turnaround;
    }
  }

  return processos;
}

let globalOrdemProcessos = 1;

const criarProcesso = document.querySelector(".button-criar-processo");
criarProcesso.addEventListener("click", () => {
  let nomeProcessos = `P${globalOrdemProcessos}`;
  const valorTempoExecucao = Number(
    document.querySelector("#tempo-execucao").value
  );
  const tempoExecucao = document.querySelector("#tempo-execucao");
  const corpoTabela = document.querySelector(".inserir-processos");
  
  if(tempoExecucao.value.length === 0 || valorTempoExecucao < 1){
    tempoExecucao.value = "";
    return;
  }

  const novaLinha = document.createElement("tr");
  novaLinha.innerHTML = `<td>${globalOrdemProcessos}</td><td>${nomeProcessos}</td><td>${valorTempoExecucao}</td>`;
  corpoTabela.appendChild(novaLinha);

  globalOrdemProcessos++;
  tempoExecucao.value = "";
});

const executarProcessos = document.querySelector(".executar-processos");
executarProcessos.addEventListener("click", () => {
  const corpoTabela = document.querySelector(".inserir-processos");
  const tabela = corpoTabela.querySelectorAll("tr");
  const corpoTabelaRespostas = document.querySelector(".inserir-respostas");

  let quantum = document.querySelector(".quantum");
  let numberQuantum = Number(quantum.value);
  const processos = [];

  if(quantum.value.length === 0 || numberQuantum < 1){
    quantum.value = "";
    return;
  }

  tabela.forEach((linha) => {
    const colunas = linha.querySelectorAll("td");
    let nome = "";
    let tempoExecucao = "";

    colunas.forEach((processo, index) => {
      if (index === 1) {
        nome = processo.textContent;
      } else if (index === 2) {
        tempoExecucao = Number(processo.textContent);
      }
    });
    processos.push(new Processo(nome, tempoExecucao));
  });

  if(processos.length === 0) return;

  const result = roundRobin(processos, numberQuantum);

  const tempoMedioEspera =
    result.reduce((acc, cur) => {
      acc = acc + cur.espera;
      return acc;
    }, 0);
  const tempoMedioTurnaround =
    result.reduce((acc, cur) => {
      acc = acc + cur.turnaround;
      return acc;
    }, 0);

  const tempoTotalExecucao =
    result.reduce((acc, cur) => {
      acc = acc + cur.tempoExecucao;
      return acc;
    }, 0);

  result.forEach((processo) => {
    const novaLinha = document.createElement("tr");
    novaLinha.innerHTML = `<td>${processo.nome}</td><td>${processo.espera}</td><td>${processo.turnaround}</td>`;
    corpoTabelaRespostas.appendChild(novaLinha);
  });

  const linhaTotal = document.createElement("tr");
  linhaTotal.innerHTML = `<td>Tempo Total</td><td>${tempoMedioEspera}</td><td>${tempoMedioTurnaround}</td>`;
  corpoTabelaRespostas.appendChild(linhaTotal);

  const linhaMedia = document.createElement("tr");
  linhaMedia.innerHTML = `<td>Tempo Médio</td><td>${tempoMedioEspera / result.length}</td><td>${tempoMedioTurnaround / result.length}</td>`;
  corpoTabelaRespostas.appendChild(linhaMedia);

  const totalExecucao = document.createElement("tr");
  totalExecucao.innerHTML = `<td>Tempo execução total</td><td>${tempoTotalExecucao}</td><td>⠀⠀<td>`;
  corpoTabelaRespostas.appendChild(totalExecucao);

  quantum.value = "";
});

const resetarProcessos = document.querySelector(".resetar-processos");
resetarProcessos.addEventListener("click", () => {
  window.location.reload();
});
