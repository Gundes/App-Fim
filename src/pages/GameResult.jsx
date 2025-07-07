import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Trophy, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import StarRating from '@/components/StarRating';

const GameResult = () => {
  const [players, setPlayers] = useLocalStorage('futsal-players', []);
  const [games, setGames] = useLocalStorage('futsal-games', []);
  const [selectedTeam1, setSelectedTeam1] = useState([]);
  const [selectedTeam2, setSelectedTeam2] = useState([]);
  const [winnerTeam, setWinnerTeam] = useState(null);
  const [rankAdjustment, setRankAdjustment] = useState(0.5);
  const { toast } = useToast();

  const availablePlayers = players.filter(player => 
    !selectedTeam1.some(p => p.id === player.id) && 
    !selectedTeam2.some(p => p.id === player.id)
  );

  const addPlayerToTeam = (player, team) => {
    if (team === 1) {
      setSelectedTeam1([...selectedTeam1, player]);
    } else {
      setSelectedTeam2([...selectedTeam2, player]);
    }
  };

  const removePlayerFromTeam = (playerId, team) => {
    if (team === 1) {
      setSelectedTeam1(selectedTeam1.filter(p => p.id !== playerId));
    } else {
      setSelectedTeam2(selectedTeam2.filter(p => p.id !== playerId));
    }
  };

  const handleSubmitResult = () => {
    if (selectedTeam1.length === 0 || selectedTeam2.length === 0) {
      toast({
        title: 'Erro',
        description: 'Ambas as equipas devem ter pelo menos um jogador',
        variant: 'destructive'
      });
      return;
    }

    if (!winnerTeam) {
      toast({
        title: 'Erro',
        description: 'Selecione a equipa vencedora',
        variant: 'destructive'
      });
      return;
    }

    // Atualizar ranks dos jogadores
    const updatedPlayers = players.map(player => {
      const isInTeam1 = selectedTeam1.some(p => p.id === player.id);
      const isInTeam2 = selectedTeam2.some(p => p.id === player.id);
      
      if (!isInTeam1 && !isInTeam2) return player;

      const isWinner = (winnerTeam === 'team1' && isInTeam1) || (winnerTeam === 'team2' && isInTeam2);
      const rankChange = isWinner ? rankAdjustment : -rankAdjustment;
      const newRank = Math.max(1, Math.min(10, player.rank + rankChange));

      return {
        ...player,
        rank: newRank,
        gamesPlayed: (player.gamesPlayed || 0) + 1,
        wins: (player.wins || 0) + (isWinner ? 1 : 0),
        losses: (player.losses || 0) + (isWinner ? 0 : 1),
        rankHistory: [
          ...(player.rankHistory || []),
          { date: new Date().toISOString(), rank: newRank, change: rankChange }
        ]
      };
    });

    // Criar registro do jogo
    const gameRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      team1: selectedTeam1.map(p => ({ ...p, paid: false })),
      team2: selectedTeam2.map(p => ({ ...p, paid: false })),
      winnerTeam,
      rankAdjustment,
      rankChanges: updatedPlayers
        .filter(player => 
          selectedTeam1.some(p => p.id === player.id) || 
          selectedTeam2.some(p => p.id === player.id)
        )
        .map(player => {
          const oldPlayer = players.find(p => p.id === player.id);
          return {
            playerId: player.id,
            playerName: player.name,
            oldRank: oldPlayer.rank,
            newRank: player.rank,
            change: player.rank - oldPlayer.rank
          };
        })
    };

    setPlayers(updatedPlayers);
    setGames([...games, gameRecord]);

    toast({
      title: 'Resultado registado!',
      description: 'Os ranks dos jogadores foram atualizados'
    });

    // Reset form
    setSelectedTeam1([]);
    setSelectedTeam2([]);
    setWinnerTeam(null);
  };

  const team1Strength = selectedTeam1.length > 0 
    ? selectedTeam1.reduce((sum, p) => sum + p.rank, 0) / selectedTeam1.length 
    : 0;
  
  const team2Strength = selectedTeam2.length > 0 
    ? selectedTeam2.reduce((sum, p) => sum + p.rank, 0) / selectedTeam2.length 
    : 0;

  return (
    <>
      <Helmet>
        <title>Resultado do Jogo - Futsal App</title>
        <meta name="description" content="Registar resultado do jogo e atualizar rankings dos jogadores" />
      </Helmet>

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Resultado do Jogo</h1>
          <p className="text-gray-400">Registar o resultado e atualizar os rankings</p>
        </div>

        {players.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum jogador disponível</h3>
            <p className="text-gray-400">Adicione jogadores primeiro para registar resultados</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Equipa Vermelha */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="glass-effect border-red-500/30 bg-red-500/10">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center justify-between">
                    <span>Equipa Vermelha</span>
                    {selectedTeam1.length > 0 && (
                      <span className="text-sm">{team1Strength.toFixed(1)}</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedTeam1.map((player) => (
                    <div key={player.id} className="flex items-center space-x-3 p-2 rounded bg-red-500/10">
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=22c55e&color=fff&size=200`;
                        }}
                      />
                      <span className="text-white font-medium flex-1">{player.name}</span>
                      <StarRating rating={player.rank} size={12} showNumber={false} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePlayerFromTeam(player.id, 1)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {selectedTeam1.length === 0 && (
                    <p className="text-gray-400 text-center py-4">Nenhum jogador selecionado</p>
                  )}
                </CardContent>
              </Card>

              <Button
                onClick={() => setWinnerTeam('team1')}
                disabled={selectedTeam1.length === 0}
                className={`w-full ${
                  winnerTeam === 'team1' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/50'
                }`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Equipa Vencedora
              </Button>
            </motion.div>

            {/* Jogadores Disponíveis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Jogadores Disponíveis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                  {availablePlayers.map((player) => (
                    <div key={player.id} className="flex items-center space-x-3 p-2 rounded bg-white/5">
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=22c55e&color=fff&size=200`;
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{player.name}</p>
                        <StarRating rating={player.rank} size={12} showNumber={false} />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addPlayerToTeam(player, 1)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-6 px-2 text-xs"
                        >
                          V
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addPlayerToTeam(player, 2)}
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 h-6 px-2 text-xs"
                        >
                          A
                        </Button>
                      </div>
                    </div>
                  ))}
                  {availablePlayers.length === 0 && (
                    <p className="text-gray-400 text-center py-4">Todos os jogadores foram selecionados</p>
                  )}
                </CardContent>
              </Card>

              {/* Configurações */}
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Ajuste de Rank</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">±{rankAdjustment} estrelas</span>
                    <div className="flex gap-1">
                      {[0.25, 0.5, 0.75, 1].map(value => (
                        <Button
                          key={value}
                          variant="outline"
                          size="sm"
                          onClick={() => setRankAdjustment(value)}
                          className={`h-6 px-2 text-xs ${
                            rankAdjustment === value 
                              ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                              : 'border-white/20 text-white hover:bg-white/10'
                          }`}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSubmitResult}
                disabled={selectedTeam1.length === 0 || selectedTeam2.length === 0 || !winnerTeam}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Registar Resultado
              </Button>
            </motion.div>

            {/* Equipa Azul */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="glass-effect border-blue-500/30 bg-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center justify-between">
                    <span>Equipa Azul</span>
                    {selectedTeam2.length > 0 && (
                      <span className="text-sm">{team2Strength.toFixed(1)}</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedTeam2.map((player) => (
                    <div key={player.id} className="flex items-center space-x-3 p-2 rounded bg-blue-500/10">
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=22c55e&color=fff&size=200`;
                        }}
                      />
                      <span className="text-white font-medium flex-1">{player.name}</span>
                      <StarRating rating={player.rank} size={12} showNumber={false} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePlayerFromTeam(player.id, 2)}
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {selectedTeam2.length === 0 && (
                    <p className="text-gray-400 text-center py-4">Nenhum jogador selecionado</p>
                  )}
                </CardContent>
              </Card>

              <Button
                onClick={() => setWinnerTeam('team2')}
                disabled={selectedTeam2.length === 0}
                className={`w-full ${
                  winnerTeam === 'team2' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50'
                }`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Equipa Vencedora
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default GameResult;