
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import StarRating from '@/components/StarRating';

const Players = () => {
  const [players, setPlayers] = useLocalStorage('futsal-players', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rank: [5],
    image: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do jogador é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    const playerData = {
      id: editingPlayer ? editingPlayer.id : Date.now(),
      name: formData.name.trim(),
      rank: formData.rank[0],
      image: formData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=22c55e&color=fff&size=200`,
      gamesPlayed: editingPlayer ? editingPlayer.gamesPlayed : 0,
      wins: editingPlayer ? editingPlayer.wins : 0,
      losses: editingPlayer ? editingPlayer.losses : 0,
      rankHistory: editingPlayer ? editingPlayer.rankHistory : [{ date: new Date().toISOString(), rank: formData.rank[0] }]
    };

    if (editingPlayer) {
      setPlayers(players.map(p => p.id === editingPlayer.id ? playerData : p));
      toast({
        title: 'Sucesso!',
        description: 'Jogador atualizado com sucesso'
      });
    } else {
      setPlayers([...players, playerData]);
      toast({
        title: 'Sucesso!',
        description: 'Jogador adicionado com sucesso'
      });
    }

    resetForm();
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      rank: [player.rank],
      image: player.image
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (playerId) => {
    setPlayers(players.filter(p => p.id !== playerId));
    toast({
      title: 'Jogador removido',
      description: 'Jogador foi removido com sucesso'
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rank: [5],
      image: ''
    });
    setEditingPlayer(null);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Jogadores - Futsal App</title>
        <meta name="description" content="Gestão de jogadores da equipa de futsal" />
      </Helmet>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Jogadores</h1>
            <p className="text-gray-400 mt-2">Gerir a sua equipa de futsal</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => resetForm()}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Jogador
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingPlayer ? 'Editar Jogador' : 'Adicionar Jogador'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do jogador"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-white">Rank: {formData.rank[0]}/10</Label>
                  <Slider
                    value={formData.rank}
                    onValueChange={(value) => setFormData({ ...formData, rank: value })}
                    max={10}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <StarRating rating={formData.rank[0]} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-white">URL da Imagem (opcional)</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600">
                    {editingPlayer ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {players.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum jogador cadastrado</h3>
            <p className="text-gray-400 mb-6">Comece adicionando jogadores à sua equipa</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-white/20 hover:border-white/40 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-500/50"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=22c55e&color=fff&size=200`;
                        }}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{player.name}</CardTitle>
                        <StarRating rating={player.rank} size={14} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{player.gamesPlayed || 0}</p>
                        <p className="text-xs text-gray-400">Jogos</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">{player.wins || 0}</p>
                        <p className="text-xs text-gray-400">Vitórias</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-400">{player.losses || 0}</p>
                        <p className="text-xs text-gray-400">Derrotas</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(player)}
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(player.id)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default Players;
