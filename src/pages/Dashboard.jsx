
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Users, 
  Shuffle, 
  Trophy, 
  History, 
  PiggyBank,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const Dashboard = () => {
  const [players] = useLocalStorage('futsal-players', []);
  const [games] = useLocalStorage('futsal-games', []);
  const [cofrinhoTransactions] = useLocalStorage('futsal-cofrinho', []);

  const totalPlayers = players.length;
  const totalGames = games.length;
  const averageRank = players.length > 0 
    ? (players.reduce((sum, player) => sum + player.rank, 0) / players.length).toFixed(1)
    : 0;
  
  const cofrinhoBalance = cofrinhoTransactions.reduce((sum, transaction) => {
    return sum + (transaction.type === 'add' ? transaction.amount : -transaction.amount);
  }, 0);

  const quickActions = [
    {
      title: 'Gerir Jogadores',
      description: 'Adicionar, editar ou remover jogadores',
      icon: Users,
      link: '/players',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Gerar Equipas',
      description: 'Criar equipas equilibradas para o próximo jogo',
      icon: Shuffle,
      link: '/team-generator',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Registar Resultado',
      description: 'Inserir resultado e atualizar rankings',
      icon: Trophy,
      link: '/game-result',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Ver Histórico',
      description: 'Consultar jogos anteriores e estatísticas',
      icon: History,
      link: '/history',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const stats = [
    {
      title: 'Total de Jogadores',
      value: totalPlayers,
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Jogos Realizados',
      value: totalGames,
      icon: Calendar,
      color: 'text-green-400'
    },
    {
      title: 'Rank Médio',
      value: averageRank,
      icon: Star,
      color: 'text-yellow-400'
    },
    {
      title: 'Saldo Cofrinho',
      value: `€${cofrinhoBalance.toFixed(2)}`,
      icon: PiggyBank,
      color: 'text-purple-400'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Futsal App</title>
        <meta name="description" content="Dashboard principal da aplicação Futsal com estatísticas e ações rápidas" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Futsal App
          </h1>
          <p className="text-gray-300 text-lg">
            Gestão completa das suas equipas e jogadores
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass-effect border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.link}>
                  <Card className="glass-effect border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{action.title}</CardTitle>
                          <p className="text-gray-400 text-sm mt-1">{action.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        {games.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Últimos Jogos</h2>
              <Link 
                to="/history" 
                className="text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
              >
                Ver todos →
              </Link>
            </div>
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {games.slice(-3).reverse().map((game, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            Jogo #{games.length - index}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {new Date(game.date).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {game.winnerTeam === 'team1' ? 'Equipa Vermelha' : 'Equipa Azul'}
                        </p>
                        <p className="text-gray-400 text-sm">Vencedora</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
