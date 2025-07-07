
export const generateBalancedTeams = (selectedPlayers) => {
  if (selectedPlayers.length < 6) {
    throw new Error('Mínimo de 6 jogadores necessário');
  }

  // Ordenar jogadores por rank (descendente)
  const sortedPlayers = [...selectedPlayers].sort((a, b) => b.rank - a.rank);
  
  const team1 = [];
  const team2 = [];
  
  // Algoritmo de distribuição alternada baseado no rank
  sortedPlayers.forEach((player, index) => {
    if (index % 2 === 0) {
      team1.push(player);
    } else {
      team2.push(player);
    }
  });

  // Calcular força média das equipas
  const team1Strength = team1.reduce((sum, player) => sum + player.rank, 0) / team1.length;
  const team2Strength = team2.reduce((sum, player) => sum + player.rank, 0) / team2.length;

  // Se a diferença for muito grande, tentar rebalancear
  const strengthDifference = Math.abs(team1Strength - team2Strength);
  
  if (strengthDifference > 1 && sortedPlayers.length >= 8) {
    // Tentar trocar jogadores para equilibrar melhor
    const rebalancedTeams = rebalanceTeams(team1, team2);
    return {
      team1: rebalancedTeams.team1,
      team2: rebalancedTeams.team2,
      team1Strength: rebalancedTeams.team1Strength,
      team2Strength: rebalancedTeams.team2Strength
    };
  }

  return {
    team1,
    team2,
    team1Strength,
    team2Strength
  };
};

const rebalanceTeams = (team1, team2) => {
  let bestTeam1 = [...team1];
  let bestTeam2 = [...team2];
  let bestDifference = Math.abs(
    (team1.reduce((sum, p) => sum + p.rank, 0) / team1.length) -
    (team2.reduce((sum, p) => sum + p.rank, 0) / team2.length)
  );

  // Tentar trocar cada jogador da equipa 1 com cada jogador da equipa 2
  for (let i = 0; i < team1.length; i++) {
    for (let j = 0; j < team2.length; j++) {
      const newTeam1 = [...team1];
      const newTeam2 = [...team2];
      
      // Trocar jogadores
      [newTeam1[i], newTeam2[j]] = [newTeam2[j], newTeam1[i]];
      
      const newTeam1Strength = newTeam1.reduce((sum, p) => sum + p.rank, 0) / newTeam1.length;
      const newTeam2Strength = newTeam2.reduce((sum, p) => sum + p.rank, 0) / newTeam2.length;
      const newDifference = Math.abs(newTeam1Strength - newTeam2Strength);
      
      if (newDifference < bestDifference) {
        bestTeam1 = newTeam1;
        bestTeam2 = newTeam2;
        bestDifference = newDifference;
      }
    }
  }

  const team1Strength = bestTeam1.reduce((sum, p) => sum + p.rank, 0) / bestTeam1.length;
  const team2Strength = bestTeam2.reduce((sum, p) => sum + p.rank, 0) / bestTeam2.length;

  return {
    team1: bestTeam1,
    team2: bestTeam2,
    team1Strength,
    team2Strength
  };
};
