
import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Trophy, TrendingUp, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import StarRating from '@/components/StarRating';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Statistics = () => {
  const { playerId } = useParams();
  const [players] = useLocalStorage('futsal-players', []);
  const [games] = useLocalStorage('futsal-games', []);

  const player = players.find(p => p.id === parseInt(playerId));

  if (!player) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-white mb-2">Jogador não encontrado</h3>
        <Link to="/players">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Jogadores
          </Button>
        </Link>
      </div>
    );
  }

  // Calcular estatísticas
  const gamesPlayed = player.gamesPlayed || 0;
  const wins = player.wins || 0;
  const losses = player.losses || 0;
  const winRate = gamesPlayed > 0 ? (wins / gamesPlayed * 100) : 0;

  // Preparar dados do gráfico
  const chartData = (player.rankHistory || []).map((entry, index) => ({
    game: index + 1,
    rank: entry.rank,
    date: new Date(entry.date).toLocaleDateString('pt-PT')
  }));

  // Estatísticas dos últimos jogos
  const playerGames = games.filter(game => 
    game.team1.some(p => p.id === player.id) || 
    game.team2.some(p => p.id === player.id)
  );

  const recentGames = playerGames.slice(-5).reverse();

  return (
    <>
      <Helmet>
        <title>{player.name} - Estatísticas - Futsal App</title>
        <meta name="description" content={`Estatísticas detalhadas do jogador ${player.name}`} />
      </Helmet>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/players">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <img
              src={player.image}
              alt={player.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-green-500/50"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=22c55e&color=fff&size=200`;
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-white">{player.name}</h1>
              <StarRating rating={player.rank} />
            </div>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Jogos</p>
                  <p className="text-2xl font-bold text-white">{gamesPlayed}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Vitórias</p>
                  <p className="text-2xl font-bold text-green-400">{wins}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Taxa de Vitória</p>
                  <p className="text-2xl font-bold text-yellow-400">{winRate.toFixed(1)}%</p>
                </div>
                <Target className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Rank Atual</p>
                  <p className="text-2xl font-bold text-purple-400">{player.rank.toFixed(1)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Evolução do Rank */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Evolução do Rank</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 1 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="game" 
                          stroke="#9CA3AF"
                          fontSize={12}
                        />
                        <YAxis 
                          domain={[1, 10]}
                          stroke="#9CA3AF"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                          labelFormatter={(value) => `Jogo ${value}`}
                          formatter={(value) => [value.toFixed(1), 'Rank']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rank" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-400">Dados insuficientes para mostrar o gráfico</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Últimos Jogos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Últimos Jogos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentGames.length > 0 ? (
                  recentGames.map((game, index) => {
                    const isInTeam1 = game.team1.some(p => p.id === player.id);
                    const isWinner = (game.winnerTeam === 'team1' && isInTeam1) || 
                                   (game.winnerTeam === 'team2' && !isInTeam1);
                    const rankChange = game.rankChanges.find(rc => rc.playerId === player.id);

                    return (
                      <div key={game.id} className="flex items-center justify-between p-3 rounded bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isWinner ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {isWinner ? (
                              <Trophy className="w-4 h-4 text-green-400" />
                            ) : (
                              <span className="text-red-400 text-sm">L</span>
                            )}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {isInTeam1 ? 'Equipa Vermelha' : 'Equipa Azul'}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {new Date(game.date).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        </div>
                        {rankChange && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            rankChange.change > 0 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {rankChange.change > 0 ? '+' : ''}{rankChange.change.toFixed(1)}
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-8">Nenhum jogo registado</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detalhes Adicionais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Resumo de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400 mb-2">{wins}</p>
                  <p className="text-gray-400">Vitórias</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-400 mb-2">{losses}</p>
                  <p className="text-gray-400">Derrotas</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full" 
                      style={{ width: `${gamesPlayed > 0 ? (losses / gamesPlayed) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400 mb-2">{gamesPlayed}</p>
                  <p className="text-gray-400">Total de Jogos</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-blue-400 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Statistics;
