export const initialConversations = [
  {
    id: 1,
    user_id: 3,
    data_criacao: "2026-01-24 14:00:00",
    ultima_pergunta: "Como organizar um cronograma de estudos?",
    messages: [
      {
        id: 1,
        conversation_id: 1,
        tipo: "pergunta",
        conteudo: "Como organizar um cronograma de estudos eficiente para o semestre?",
        data_criacao: "2026-01-24 14:00:00"
      },
      {
        id: 2,
        conversation_id: 1,
        tipo: "resposta",
        conteudo: "Olá! Como Consultor Académico da ISPOTEC, recomendo estruturar o teu plano através das seguintes etapas:\n\n1. **Mapeamento de Carga Horária**: Lista as disciplinas mais exigentes (ex: Algoritmos e Programação) e distribui blocos de 90 minutos com pausas de 15 minutos (Método Pomodoro estendido).\n2. **Estudo Ativo**: Em vez de apenas ler notas, resolve exercícios práticos e elabora resumos conceituais.\n3. **Revisões Espaçadas**: Revê o conteúdo 24 horas depois, 1 semana depois e 1 mês depois para retenção a longo prazo (Ebbinghaus, H., 1885).\n\nDesejas que elabore um plano semanal específico para as tuas disciplinas?",
        data_criacao: "2026-01-24 14:00:05"
      }
    ]
  }
];

export const cannedBotResponses = [
  {
    keywords: ["tecnica", "tecnicas", "metodo", "estudo", "estudar"],
    response: "Como Consultor Académico da ISPOTEC, recomendo as seguintes técnicas comprovadas:\n\n1. **Técnica de Feynman**: Explica a matéria em termos simples, como se estivesses a ensinar alguém que nunca a estudou. Identifica lacunas e volta à fonte.\n2. **Repetição Espaçada**: Revisa a matéria em intervalos graduais para consolidar a memória de longo prazo.\n3. **Resolução de Problemas Reais**: Aplica os conceitos teóricos em exercícios práticos e projetos de laboratório.\n\n*Referência: Dunlosky, J. et al. (2013). Improving Students' Learning With Effective Learning Techniques.*"
  },
  {
    keywords: ["plano", "cronograma", "horario", "rotina"],
    response: "Para construir um plano de estudo eficaz no ISPOTEC:\n\n1. Define horários fixos e livres de distrações.\n2. Prioriza disciplinas com maior nível de complexidade no início do dia.\n3. Reserva pelo menos 2 horas semanais para consulta bibliográfica na biblioteca digital e debate em grupo.\n4. Inclui pausas ativas e descanso regular.\n\nPosso ajudar-te a detalhar um plano para uma disciplina específica!"
  },
  {
    keywords: ["exame", "exames", "teste", "avaliacao", "preparacao"],
    response: "A preparação ideal para exames envolve três fases essenciais:\n\n1. **Fase de Diagnóstico (3 semanas antes)**: Mapear tópicos principais e provas de semestres anteriores.\n2. **Fase Intensiva (2 semanas antes)**: Realizar simulações com tempo cronometrado sem consultar anotações.\n3. **Fase de Consolidação (últimos dias)**: Revisão dos resumos chave e descanso adequado na véspera.\n\nMantém a calma e foca na clareza dos conceitos fundamentais!"
  },
  {
    keywords: ["materia", "entender", "dificuldade", "explicacao", "simples"],
    response: "Compreendo perfeitamente! Para aprender qualquer matéria difícil:\n\n1. Começa pela 'visão geral': qual é o objetivo desta teoria ou ferramenta?\n2. Decompõe o tema em blocos menores.\n3. Procura exemplos práticos no mundo real.\n\nIndica-me qual é a disciplina ou tema específico que estás a estudar, e explicarei passo a passo com exemplos!"
  }
];
