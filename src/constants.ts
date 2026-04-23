import { Sword, Clover, Castle } from 'lucide-react';

export const GAMES = {
  'batalha-naval': {
    id: 'batalha-naval',
    title: 'Batalha Naval',
    category: 'strategy',
    type: 'PvP',
    description: 'Afunde a frota inimiga antes que afundem a sua.',
  },
  'dama': {
    id: 'dama',
    title: 'Dama Real',
    category: 'strategy',
    type: 'PvP',
    description: 'O clássico jogo de tabuleiro em uma versão medieval.',
  },
  'jogo-da-velha': {
    id: 'jogo-da-velha',
    title: 'Duelo de Símbolos',
    category: 'strategy',
    type: 'PvP',
    description: 'Rápido e mortal. Três em linha para a vitória.',
  },
  'dados': {
    id: 'dados',
    title: 'Dados da Sorte',
    category: 'luck',
    type: 'PvP',
    description: 'Aposte no valor dos dados contra seu oponente.',
  },
  'cara-coroa': {
    id: 'cara-coroa',
    title: 'Cara ou Coroa',
    category: 'luck',
    type: 'PvP',
    description: 'O destino em uma única moeda de ouro.',
  },
  'roleta': {
    id: 'roleta',
    title: 'Roleta Real',
    category: 'house',
    type: 'PvH',
    description: 'A sorte gira na roda da fortuna.',
  },
  'crash': {
    id: 'crash',
    title: 'A Queda do Castelo',
    category: 'house',
    type: 'PvH',
    description: 'O multiplicador sobe até o castelo cair. Retire-se a tempo!',
  },
  'mines': {
    id: 'mines',
    title: 'Minas do Rei',
    category: 'house',
    type: 'PvH',
    description: 'Encontre os tesouros e evite as armadilhas explosivas.',
  }
};

export const CATEGORIES = {
  strategy: {
    id: 'strategy',
    title: 'Estratégia de Guerra',
    icon: Sword,
    color: 'from-blue-900/40 to-indigo-900/40',
    games: ['batalha-naval', 'dama', 'jogo-da-velha']
  },
  luck: {
    id: 'luck',
    title: 'A Bengala da Sorte',
    icon: Clover,
    color: 'from-emerald-900/40 to-green-900/40',
    games: ['dados', 'cara-coroa']
  },
  house: {
    id: 'house',
    title: 'A Casa Real',
    icon: Castle,
    color: 'from-rose-900/40 to-red-900/40',
    games: ['roleta', 'crash', 'mines']
  }
};
