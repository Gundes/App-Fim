
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shuffle, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generateBalancedTeams } from '@/utils/teamGenerator';
import StarRating from '@/components/StarRating';

const TeamGenerator = () => {
  const [players] = useLocalStorage('futsal-players', []);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [generatedTeams, setGeneratedTeams] = useState(null);
  const { toast } = useToast();

  const handlePlayerToggle = (player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

  const handleGenerateTeams = () => {
    if (selectedPlayers.length < 6) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos 6 jogadores para gerar as equipas',
        variant: 'destructive'
      });
      return;
    }

    try {
      const teams = generateBalancedTeams(selectedPlayers);
      setGeneratedTeams(teams);
      toast({
        title: 'Equipas geradas!',
        description: 'As equipas foram criadas de forma equilibrada'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleRegenerateTeams = () => {
    // Embaralhar a lista de jogadores antes de gerar novamente
    const shuffledPlayers = [...selectedPlayers].sort(() => Math.random() - 0.5);
    try {
      const teams = generateBalancedTeams(shuffledPlayers);
      setGeneratedTeams(teams);
      toast({
        title: 'Equipas regeneradas!',
        description: 'Novas equipas foram criadas'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const selectAll = () => {
    setSelectedPlayers([...players]);
  };

  const clearSelection = () => {
    setSelectedPlayers([]);
    setGeneratedTeams(null);
  };

  return (
    <>
      <Helmet>
        <title>Gerador de Equipas - Futsal App</title>
        <meta name="description" content="Gere equipas equilibradas para os seus jogos de futsal" />
      </Helmet>

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Gerador de Equipas</h1>
          <p className="text-gray-400">Selecione os jogadores e gere equipas equilibradas</p>
        </div>

        {players.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum jogador disponível</h3>
            <p className="text-gray-400">Adicione jogadores primeiro para gerar equipas</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seleção de Jogadores */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="glass-effect border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      Jogadores Disponíveis ({selectedPlayers.length}/{players.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAll}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Todos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {players.map((player) => {
                    const isSelected = selectedPlayers.some(p => p.id === player.id);
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center space-x-4 p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-green-500/20 border-green-500/50' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => handlePlayerToggle(player)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handlePlayerToggle(player)}
                        />
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=22c55e&color=fff&size=200`;
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{player.name}</p>
                          <StarRating rating={player.rank} size={12} showNumber={false} />
                        </div>
                        <span className="text-sm text-gray-400">{player.rank.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  onClick={handleGenerateTeams}
                  disabled={selectedPlayers.length < 6}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Gerar Equipas
                </Button>
                {generatedTeams && (
                  <Button
                    onClick={handleRegenerateTeams}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Regenerar
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Equipas Geradas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {generatedTeams ? (
                <>
                  {/* Equipa Vermelha */}
                  <Card className="glass-effect border-red-500/30 bg-red-500/10">
                    <CardHeader>
                      <CardTitle className="text-red-400 flex items-center justify-between">
                        <span>Equipa Vermelha</span>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">{generatedTeams.team1Strength.toFixed(1)}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {generatedTeams.team1.map((player) => (
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
                          <span className="text-sm text-gray-400">{player.rank.toFixed(1)}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Equipa Azul */}
                  <Card className="glass-effect border-blue-500/30 bg-blue-500/10">
                    <CardHeader>
                      <CardTitle className="text-blue-400 flex items-center justify-between">
                        <span>Equipa Azul</span>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">{generatedTeams.team2Strength.toFixed(1)}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {generatedTeams.team2.map((player) => (
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
                          <span className="text-sm text-gray-400">{player.rank.toFixed(1)}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Diferença de Força */}
                  <Card className="glass-effect border-white/20">
                    <CardContent className="p-4 text-center">
                      <p className="text-gray-400 text-sm mb-2">Diferença de Força</p>
                      <p className="text-2xl font-bold text-white">
                        {Math.abs(generatedTeams.team1Strength - generatedTeams.team2Strength).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.abs(generatedTeams.team1Strength - generatedTeams.team2Strength) < 0.5 
                          ? 'Equipas muito equilibradas!' 
                          : Math.abs(generatedTeams.team1Strength - generatedTeams.team2Strength) < 1
                          ? 'Equipas equilibradas'
                          : 'Considere regenerar as equipas'
                        }
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="glass-effect border-white/20">
                  <CardContent className="p-12 text-center">
                    <Shuffle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Equipas não geradas</h3>
                    <p className="text-gray-400">Selecione pelo menos 6 jogadores e clique em "Gerar Equipas"</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeamGenerator;
