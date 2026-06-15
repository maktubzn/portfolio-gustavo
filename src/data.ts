/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AboutContent, CardData, HeroContent } from "./types";

export const HERO_CONTENT: HeroContent = {
  titleLines: ["Gustavo Alves", "Portfólio de tecnologia", "QA em aprendizado"],
  scrollLabel: "Ver sobre",
};

export const ABOUT_CONTENT: AboutContent = {
  brand: "GUSTAVO",
  portraitUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1400&auto=format&fit=crop",
  portraitAlt: "Imagem temporária de retrato; substituir por foto real de Gustavo",
  experienceLabel: "FOCO",
  experienceValue: "JOVEM APRENDIZ EM TECNOLOGIA",
  achievementsLabel: "Em desenvolvimento",
  achievements: [
    "INFORMÁTICA PARA INTERNET - ETEC FRANCO DA ROCHA",
    "INTERESSE EM QA E TESTES DE SOFTWARE",
    "PROJETOS DE ESTUDO EM WEB, MOBILE, AUTOMAÇÃO E HARDWARE",
  ],
  hudStats: [
    { label: "CIDADE", value: "MAIRIPORÃ/SP" },
    { label: "IDADE", value: "17" },
    { label: "FOCO", value: "QA" },
  ],
};

export const CARDS_DATA: CardData[] = [
  {
    id: 1,
    title: "GS Shopping",
    projectName: "GS Shopping",
    category: "MVP local de e-commerce / Em desenvolvimento",
    imageUrl: "/assets/projects/gs-shopping/card.webp",
    story: [
      {
        phase: "ORIGEM",
        title: "Entender sistemas de venda e marketplace",
        text: "Surgiu da vontade de entender sistemas de venda e marketplace, depois de perceber limitações e custos em plataformas prontas para quem está começando."
      },
      {
        phase: "PRIMEIRO PROTÓTIPO",
        title: "Estudo de e-commerce e evolução de MVP",
        text: "Começou como estudo de e-commerce e evoluiu para um MVP local com vitrine, catálogo e fluxo de compra.",
        imageUrl: "/assets/projects/gs-shopping/modal-01.webp"
      },
      {
        phase: "CONSTRUÇÃO",
        title: "API, frontends e painel de controle",
        text: "Foram criadas API, duas interfaces/frontends, autenticação, controle de usuário, painel administrativo, estoque, campanhas e checkout local.",
        imageUrl: "/assets/projects/gs-shopping/modal-02.webp"
      },
      {
        phase: "TESTES E VALIDAÇÃO",
        title: "Navegação, permissões e checkout local",
        text: "Validação de cadastro, login, permissão, estoque, navegação, checkout local e comportamento em navegador.",
        imageUrl: "/assets/projects/gs-shopping/modal-03.webp"
      },
      {
        phase: "LIMITAÇÕES REAIS",
        title: "Ambiente local simulado",
        text: "Sem produção pública, sem gateway de pagamento, sem pagamento real e sem usuários reais. O checkout é local/simulado."
      },
      {
        phase: "APRENDIZADOS",
        title: "Autenticação, banco local e integridade de dados",
        text: "Aprendi sobre autenticação, API, banco local, cookies, JWT, bcrypt, painel admin, fluxo de usuário e a importância de testar antes de considerar algo pronto.",
        imageUrl: "/assets/projects/gs-shopping/modal-04.webp"
      },
      {
        phase: "PRÓXIMOS PASSOS",
        title: "Organização geral e testes unitários",
        text: "Organizar README, prints, bugs reais, casos de teste e instruções de execução."
      }
    ]
  },
  {
    id: 2,
    title: "Jogo React + Arduino",
    projectName: "Jogo React + Arduino",
    category: "Projeto escolar em equipe / Apresentado na escola",
    imageUrl: "/assets/projects/jogo-react-arduino/card.webp",
    story: [
      {
        phase: "ORIGEM",
        title: "Unindo web, hardware e dinâmica física",
        text: "Projeto escolar criado em dupla para uma apresentação prática, unindo web, Arduino e interação com o público."
      },
      {
        phase: "PRIMEIRO PROTÓTIPO",
        title: "Interface controlada por comunicação serial",
        text: "Começou com a ideia de criar uma dinâmica interativa controlada por interface web e conectada ao Arduino.",
        imageUrl: "/assets/projects/jogo-react-arduino/modal-01.webp"
      },
      {
        phase: "CONSTRUÇÃO",
        title: "Modos de exibição e controle operacional",
        text: "Foram desenvolvidas a interface do jogo, a tela administrativa e a exibição em TV para o público acompanhar a dinâmica.",
        imageUrl: "/assets/projects/jogo-react-arduino/modal-02.webp"
      },
      {
        phase: "TESTES E VALIDAÇÃO",
        title: "Estabilidade em ensaios reais",
        text: "O projeto foi testado em ambiente real de apresentação, com ajustes de montagem, interação, controle e exibição.",
        imageUrl: "/assets/projects/jogo-react-arduino/modal-03.webp"
      },
      {
        phase: "LIMITAÇÕES REAIS",
        title: "Falta de documentação finalizada",
        text: "Ainda precisa de documentação técnica mais organizada e evidências finais selecionadas.",
        imageUrl: "/assets/projects/jogo-react-arduino/modal-04.webp"
      },
      {
        phase: "APRENDIZADOS",
        title: "Trabalho em equipe e resiliência física",
        text: "Aprendi sobre trabalho em equipe, integração física/digital, teste em ambiente real e adaptação durante uma apresentação."
      },
      {
        phase: "PRÓXIMOS PASSOS",
        title: "Adicionar registros e documentar falhas",
        text: "Criar README, adicionar fotos/vídeos, registrar falhas encontradas e descrever melhor minha parte no projeto."
      }
    ]
  },
  {
    id: 3,
    title: "GestMecanic",
    projectName: "GestMecanic",
    category: "Estudo mobile para oficina / Em desenvolvimento",
    imageUrl: "/assets/projects/gestmecanic/card.webp",
    story: [
      {
        phase: "ORIGEM",
        title: "Inspirado em uma oficina mecânica familiar",
        text: "Surgiu a partir da observação de uma rotina real de oficina familiar e da vontade de criar algo útil para organizar veículos, clientes e serviços."
      },
      {
        phase: "PRIMEIRO PROTÓTIPO",
        title: "Primeiros passos no React Native",
        text: "Começou em React Native, como estudo de app mobile para oficina.",
        imageUrl: "/assets/projects/gestmecanic/modal-01.webp"
      },
      {
        phase: "CONSTRUÇÃO",
        title: "Modelagem do fluxo de atendimento",
        text: "A ideia foi evoluindo para organizar status de atendimento, veículos, clientes e fluxo de serviços sem virar um ERP pesado.",
        imageUrl: "/assets/projects/gestmecanic/modal-02.webp"
      },
      {
        phase: "MUDANÇA DE DIREÇÃO",
        title: "Migração para Android nativo por performance",
        text: "Ao perceber limitações de performance e controle técnico no caminho inicial, comecei a estudar uma versão em Android nativo.",
        imageUrl: "/assets/projects/gestmecanic/modal-03.webp"
      },
      {
        phase: "TESTES E VALIDAÇÃO",
        title: "Fase de estudo e testes realistas",
        text: "Ainda está em fase de estudo e tentativa de evolução. A validação real depende de organizar melhor o MVP.",
        imageUrl: "/assets/projects/gestmecanic/modal-04.webp"
      },
      {
        phase: "LIMITAÇÕES REAIS",
        title: "Sem conclusão ou clientes reais",
        text: "Não está concluído, não está em produção e não possui clientes reais. É estudo de mobile/produto em andamento."
      },
      {
        phase: "APRENDIZADOS",
        title: "A escolha da tecnologia ideal para o usuário",
        text: "Aprendi que escolher tecnologia não é só ir pelo mais rápido; performance, controle e contexto do usuário importam."
      },
      {
        phase: "PRÓXIMOS PASSOS",
        title: "Escopo mínimo e validação de fluxo",
        text: "Definir escopo mínimo, organizar telas, documentar fluxo e validar com um uso realista."
      }
    ]
  },
  {
    id: 4,
    title: "QA Lab",
    projectName: "QA Lab",
    category: "Evidências e testes / Em organização",
    imageUrl: "/assets/projects/qa-lab/card.webp",
    story: [
      {
        phase: "ORIGEM",
        title: "Provar com evidências, não apenas telas",
        text: "Surgiu da necessidade de provar melhor o que acontece nos meus projetos, não só mostrar telas bonitas."
      },
      {
        phase: "ESTRUTURA",
        title: "Organização de casos, bugs e checklists",
        text: "Área criada para organizar casos de teste, bug reports, evidências, checklists e aprendizados.",
        imageUrl: "/assets/projects/qa-lab/modal-01.webp"
      },
      {
        phase: "COMO SERÁ USADO",
        title: "Passos de reprodução e bug tracking",
        text: "Cada projeto poderá ter bugs documentados com passos de reprodução, resultado esperado, resultado obtido, evidência e status.",
        imageUrl: "/assets/projects/qa-lab/modal-02.webp"
      },
      {
        phase: "LIMITAÇÕES REAIS",
        title: "Organização inicial sem dados fictícios",
        text: "Ainda está em organização e não deve inventar bugs ou evidências.",
        imageUrl: "/assets/projects/qa-lab/modal-03.webp"
      },
      {
        phase: "APRENDIZADOS",
        title: "QA na prática de entrevistas",
        text: "Ajuda a transformar meu interesse por QA em prática visível e defensável em entrevista."
      },
      {
        phase: "PRÓXIMOS PASSOS",
        title: "Casos de teste do GS Shopping e automação",
        text: "Adicionar primeiros casos de teste do GS Shopping, prints, bugs reais e validações."
      }
    ]
  },
  {
    id: 5,
    title: "GlowAgend",
    projectName: "GlowAgend",
    category: "SaaS de agendamento por etapas / Em desenvolvimento",
    imageUrl: "/assets/projects/glowagend/overview-light.png",
    story: [
      {
        phase: "ORIGEM",
        title: "Dificuldade de agendamento em salões de beleza",
        text: "Surgiu da necessidade de criar um fluxo de agendamento inteligente por etapas, facilitando a escolha de profissionais e serviços em horários otimizados."
      },
      {
        phase: "PRIMEIRO PROTÓTIPO",
        title: "Protótipo baseado em fluxos n8n",
        text: "Iniciou com integrações no n8n para automatizar agendamentos e notificações via WhatsApp.",
        imageUrl: "/assets/projects/glowagend/agenda-timeline-light.png"
      },
      {
        phase: "CONSTRUÇÃO",
        title: "Remoção de n8n e worker API-first",
        text: "Evoluiu para uma arquitetura com banco Supabase, API Fastify e um processador de eventos robusto usando o padrão Transactional Outbox.",
        imageUrl: "/assets/projects/glowagend/agenda-calendar-light.png"
      },
      {
        phase: "TESTES E VALIDAÇÃO",
        title: "Simulação de carga de concorrência e RLS",
        text: "Ajustado com controle de idempotência de eventos, controle de concorrência e RLS no Supabase para garantir isolamento multi-tenant.",
        imageUrl: "/assets/projects/glowagend/services-refresh-light.png"
      },
      {
        phase: "LIMITAÇÕES REAIS",
        title: "Fila WAHA simulada localmente",
        text: "Os envios de WhatsApp reais dependem de um gateway WAHA ativo, rodando atualmente em modo dry-run local."
      },
      {
        phase: "APRENDIZADOS",
        title: "Arquitetura orientada a eventos e filas Outbox",
        text: "Aprendi a implementar filas Outbox transacionais resilientes e isolamento de banco com RLS a nível de banco."
      },
      {
        phase: "PRÓXIMOS PASSOS",
        title: "Automação de agendamentos recorrentes",
        text: "Implementar agendamento recorrente e painéis de analytics para faturamento mensal dos profissionais."
      }
    ]
  }
];
