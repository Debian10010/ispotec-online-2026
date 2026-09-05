export const initialPosts = [
  {
    id: 1,
    user_id: 2,
    group_id: 1,
    titulo: "Guia de Boas Práticas: Componentização em React e Gestão de Estado",
    conteudo: "Caros estudantes, compartilho um resumo sobre boas práticas no desenvolvimento de interfaces reativas com React. Lembrem-se de manter os componentes puros, separar a lógica de negócio na camada de serviços e utilizar hooks de forma consciente.",
    tipo: "material",
    data_criacao: "2026-01-20 10:30:00",
    comments: [
      {
        id: 1,
        post_id: 1,
        user_id: 3,
        nome: "Ana Beatriz Tembe",
        conteudo: "Excelente material, professor! Ajudou bastante na estruturação do nosso projeto semestral.",
        data_criacao: "2026-01-20 11:15:00"
      },
      {
        id: 2,
        post_id: 1,
        user_id: 4,
        nome: "Carlos Mabunda",
        conteudo: "Muito claro. Vamos aplicar estas diretrizes na apresentação da próxima semana.",
        data_criacao: "2026-01-20 14:00:00"
      }
    ]
  },
  {
    id: 2,
    user_id: 3,
    group_id: 1,
    titulo: "Dúvida sobre Rotas Aninhadas e Autenticação Protegida",
    conteudo: "Olá colegas! Ao implementar uma rota protegida para o dashboard com React Router, qual é a abordagem recomendada para redirecionar o utilizador de volta à página anterior após o login?",
    tipo: "discussao",
    data_criacao: "2026-01-22 15:45:00",
    comments: [
      {
        id: 3,
        post_id: 2,
        user_id: 2,
        nome: "Prof. Manuel Cossa",
        conteudo: "Olá Ana! Podes passar o 'location' no state do componente Navigate/redirect e resgatar através de useLocation() após autenticação bem-sucedida.",
        data_criacao: "2026-01-22 16:30:00"
      }
    ]
  },
  {
    id: 3,
    user_id: 1,
    group_id: 2,
    titulo: "Complexidade Assintótica em Algoritmos de Ordenação",
    conteudo: "Artigo de revisão sobre o comportamento de Quicksort, Mergesort e Heapsort em cenários de pior caso e caso médio. Recomendado para todos os estudantes de Ciências da Computação.",
    tipo: "artigo",
    data_criacao: "2026-01-24 09:20:00",
    comments: []
  },
  {
    id: 4,
    user_id: 4,
    group_id: 3,
    titulo: "Projeto Final: Sistema de Gestão Académica Integrado",
    conteudo: "Estamos a desenvolver um protótipo com banco de dados MySQL normalizado em 3FN para gestão de matrículas e notas. Procuramos mais um colega para colaborar no módulo de relatórios.",
    tipo: "projeto",
    data_criacao: "2026-01-25 18:00:00",
    comments: [
      {
        id: 4,
        post_id: 4,
        user_id: 3,
        nome: "Ana Beatriz Tembe",
        conteudo: "Tenho interesse, Carlos! Vamos alinhar os detalhes no chat do grupo.",
        data_criacao: "2026-01-25 18:30:00"
      }
    ]
  }
];
