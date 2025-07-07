
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { PiggyBank, Plus, Minus, Euro, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const Cofrinho = () => {
  const [transactions, setTransactions] = useLocalStorage('futsal-cofrinho', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('add');
  const [formData, setFormData] = useState({
    amount: '',
    description: ''
  });
  const { toast } = useToast();

  const balance = transactions.reduce((sum, transaction) => {
    return sum + (transaction.type === 'add' ? transaction.amount : -transaction.amount);
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Erro',
        description: 'Insira um valor válido',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Erro',
        description: 'Descrição é obrigatória',
        variant: 'destructive'
      });
      return;
    }

    if (transactionType === 'remove' && amount > balance) {
      toast({
        title: 'Erro',
        description: 'Saldo insuficiente',
        variant: 'destructive'
      });
      return;
    }

    const transaction = {
      id: Date.now(),
      type: transactionType,
      amount: amount,
      description: formData.description.trim(),
      date: new Date().toISOString(),
      category: 'manual'
    };

    setTransactions([...transactions, transaction]);
    
    toast({
      title: 'Sucesso!',
      description: `€${amount.toFixed(2)} ${transactionType === 'add' ? 'adicionado ao' : 'removido do'} cofrinho`
    });

    resetForm();
  };

  const handleDelete = (transactionId) => {
    setTransactions(transactions.filter(t => t.id !== transactionId));
    toast({
      title: 'Transação removida',
      description: 'A transação foi removida do histórico'
    });
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      description: ''
    });
    setIsDialogOpen(false);
  };

  const openDialog = (type) => {
    setTransactionType(type);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Cofrinho - Futsal App</title>
        <meta name="description" content="Gestão do cofrinho da equipa de futsal" />
      </Helmet>

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Cofrinho</h1>
          <p className="text-gray-400">Gestão das finanças da equipa</p>
        </div>

        {/* Saldo Atual */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="glass-effect border-white/20 max-w-md mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <PiggyBank className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h2 className="text-sm text-gray-400 mb-2">Saldo Atual</h2>
              <p className={`text-4xl font-bold mb-4 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                €{balance.toFixed(2)}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => openDialog('add')}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
                <Button
                  onClick={() => openDialog('remove')}
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Histórico de Transações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Histórico de Transações</span>
                <span className="text-sm text-gray-400">({transactions.length} transações)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Euro className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhuma transação</h3>
                  <p className="text-gray-400">As transações aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                  {transactions.slice().reverse().map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'add' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.type === 'add' ? (
                            <Plus className="w-5 h-5" />
                          ) : (
                            <Minus className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{transaction.description}</p>
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(transaction.date).toLocaleDateString('pt-PT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${
                          transaction.type === 'add' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'add' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                        </span>
                        {transaction.category === 'manual' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Dialog para adicionar/remover dinheiro */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="glass-effect border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">
                {transactionType === 'add' ? 'Adicionar Dinheiro' : 'Remover Dinheiro'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">Valor (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Motivo da transação"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className={`flex-1 ${
                    transactionType === 'add' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {transactionType === 'add' ? (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 mr-2" />
                      Remover
                    </>
                  )}
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
    </>
  );
};

export default Cofrinho;
