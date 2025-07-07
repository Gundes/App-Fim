import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { History as HistoryIcon, Trophy, Calendar, Euro, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const History = () => {
  const [games, setGames] = useLocalStorage('futsal-games', []);
  const [cofrinhoTransactions, setCofrinhoTransactions] = useLocalStorage('futsal-cofrinho', []);
  const [fineDialogOpen, setFineDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const { toast } = useToast();

  const fineOptions = [
    { label: 'Atraso até 5min', value: 0.50 },
    { label: 'Atraso mais de 5min', value: 1.00 },
    { label: 'Falta de colete', value: 0.50 }
  ];

  const handlePayment = (fineOption = null) => {
    if (!selectedPlayer || !selectedGameId) return;

    // Adicionar transação se houver multa
    if (fineOption) {
      const transaction = {
        id: Date.now(),
        type: 'add',
        amount: fineOption.value,
        description: `Multa: ${fineOption.label} - ${selectedPlayer.name}`,
        date: new Date().toISOString(),
        category: 'multa'
      };
      setCofrinhoTransactions([...cofrinhoTransactions, transaction]);
      toast({
        title: 'Multa adicionada!',
        description: `€${fineOption.value.toFixed(2)} adicionado ao cofrinho`
      });
    } else {
       toast({
        title: 'Pagamento registado!',
        description: `Pagamento de ${selectedPlayer.name} registado sem multa.`
      });
    }

    // Atualizar o estado de pagamento do jogador no jogo
    const updatedGames = games.map(game => {
      if (game.id === selectedGameId) {
        const updateTeam = (team) => team.map(p => 
          p.id === selectedPlayer.id ? { ...p, paid: true } : p
        );
        return {
          ...game,
          team1: updateTeam(game.team1),
          team2: updateTeam(game.team2)
        };
      }
      return game;
    });
    setGames(updatedGames);

    setFineDialogOpen(false);
    setSelectedPlayer(null);
    setSelectedGameId(null);
  };

  const openFineDialog = (player, gameId) => {
    setSelectedPlayer(player);
    setSelectedGameId(gameId);
    setFineDialogOpen(true);
  };

  if (games.length === 0) {
    return (
      <>
        <Helmet>
          <title>Histórico - Futsal App</title>
          <meta name="description" content="Histórico de jogos e estatísticas da equipa de futsal" />
        </Helmet>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-white">Histórico</h1>
            <p className="text-gray-400">Registo de todos os jogos realizados</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <HistoryIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum jogo registado</h3>
            <p className="text-gray-400">Os jogos aparecerão aqui após serem registados</p>
          </motion.div>
        </div>
      </>
    );
  }

  const PlayerRow = ({ player, gameId, rankChanges }) => {
    const rankChange = rankChanges.find(rc => rc.playerId === player.id);
    return (
      <div className="flex items-center justify-between p-2 rounded bg-white/10">
        <div className="flex items-center gap-3">
          <img
            src={player.image}
            alt={player.name}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=22c55e&color=fff&size=200`;
            }}
          />
          <span className="text-white font-medium">{player.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {rankChange && (
            <span className={`text-xs px-2 py-1 rounded ${
              rankChange.change > 0 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {rankChange.change > 0 ? '+' : ''}{rankChange.change.toFixed(1)}
            </span>
          )}
          <Button
            size="sm"
            onClick={() => openFineDialog(player, gameId)}
            disabled={player.paid}
            className={`h-6 px-2 text-xs text-white transition-colors ${
              player.paid 
                ? 'bg-green-600 hover:bg-green-700 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {player.paid ? 'Pago' : 'Pagar'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Histórico - Futsal App</title>
        <meta name="description" content="Histórico de jogos e estatísticas da equipa de futsal" />
      </Helmet>

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Histórico</h1>
          <p className="text-gray-400">Registo de todos os jogos realizados ({games.length} jogos)</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {games.slice().reverse().map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <span>Jogo #{games.length - index}</span>
                        <p className="text-sm text-gray-400 font-normal">
                          {new Date(game.date).toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </CardTitle>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {game.winnerTeam === 'team1' ? 'Equipa Vermelha' : 'Equipa Azul'}
                      </p>
                      <p className="text-green-400 text-sm">Vencedora</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Equipa Vermelha */}
                    <div className="space-y-3">
                      <h4 className="text-red-400 font-semibold flex items-center gap-2">
                        Equipa Vermelha
                        {game.winnerTeam === 'team1' && <Trophy className="w-4 h-4" />}
                      </h4>
                      <div className="space-y-2">
                        {game.team1.map((player) => (
                          <PlayerRow key={player.id} player={player} gameId={game.id} rankChanges={game.rankChanges} />
                        ))}
                      </div>
                    </div>

                    {/* Equipa Azul */}
                    <div className="space-y-3">
                      <h4 className="text-blue-400 font-semibold flex items-center gap-2">
                        Equipa Azul
                        {game.winnerTeam === 'team2' && <Trophy className="w-4 h-4" />}
                      </h4>
                      <div className="space-y-2">
                        {game.team2.map((player) => (
                          <PlayerRow key={player.id} player={player} gameId={game.id} rankChanges={game.rankChanges} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Resumo das alterações */}
                  <div className="border-t border-white/10 pt-4">
                    <h5 className="text-white font-medium mb-3">Alterações de Rank</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {game.rankChanges.map((change) => (
                        <div key={change.playerId} className="flex items-center justify-between p-2 rounded bg-white/5">
                          <span className="text-gray-300 text-sm">{change.playerName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">{change.oldRank.toFixed(1)}</span>
                            <span className="text-gray-500">→</span>
                            <span className="text-white text-xs">{change.newRank.toFixed(1)}</span>
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              change.change > 0 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {change.change > 0 ? '+' : ''}{change.change.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Dialog para multas */}
        <Dialog open={fineDialogOpen} onOpenChange={setFineDialogOpen}>
          <DialogContent className="glass-effect border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">
                Registar Pagamento - {selectedPlayer?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">Selecione uma opção:</p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => handlePayment()}
                  className="w-full justify-center border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  Sem Multa
                </Button>
                {fineOptions.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handlePayment(option)}
                    className="w-full justify-between border-white/20 text-white hover:bg-white/10"
                  >
                    <span>{option.label}</span>
                    <span className="text-yellow-400">€{option.value.toFixed(2)}</span>
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setFineDialogOpen(false)}
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default History;