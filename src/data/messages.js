export const initialGlobalMessages = [
  {
    id: 1,
    user_id: 1,
    user_nome: "Administrador ISPOTEC",
    user_tipo: "especialista",
    conteudo: "Bem-vindos ao ISPOTEC Online! Este espaço destina-se à comunicação aberta e partilha de conhecimento entre toda a nossa comunidade.",
    tipo_mensagem: "texto",
    ficheiro_path: null,
    ficheiro_nome: null,
    ficheiro_tamanho: null,
    data_criacao: "2026-01-23 09:00:00"
  },
  {
    id: 2,
    user_id: 2,
    user_nome: "Prof. Manuel Cossa",
    user_tipo: "docente",
    conteudo: "Bom dia a todos. As inscrições para os grupos de estudo do semestre letivo estão abertas.",
    tipo_mensagem: "texto",
    ficheiro_path: null,
    ficheiro_nome: null,
    ficheiro_tamanho: null,
    data_criacao: "2026-01-23 09:15:00"
  },
  {
    id: 3,
    user_id: 3,
    user_nome: "Ana Beatriz Tembe",
    user_tipo: "estudante",
    conteudo: "Excelente iniciativa! A plataforma ficou muito prática e intuitiva.",
    tipo_mensagem: "texto",
    ficheiro_path: null,
    ficheiro_nome: null,
    ficheiro_tamanho: null,
    data_criacao: "2026-01-23 09:20:00"
  }
];

export const initialGroupMessages = {
  1: [
    {
      id: 101,
      user_id: 2,
      group_id: 1,
      user_nome: "Prof. Manuel Cossa",
      user_tipo: "docente",
      conteudo: "Caros alunos, bem-vindos ao grupo de Programação Web Avançada. Podem colocar aqui todas as dúvidas sobre o projeto.",
      tipo_mensagem: "texto",
      ficheiro_path: null,
      ficheiro_nome: null,
      ficheiro_tamanho: null,
      data_criacao: "2026-01-23 10:00:00"
    },
    {
      id: 102,
      user_id: 3,
      group_id: 1,
      user_nome: "Ana Beatriz Tembe",
      user_tipo: "estudante",
      conteudo: "Obrigada, professor! Já comecei a estruturar os componentes do projeto.",
      tipo_mensagem: "texto",
      ficheiro_path: null,
      ficheiro_nome: null,
      ficheiro_tamanho: null,
      data_criacao: "2026-01-23 10:30:00"
    }
  ]
};
