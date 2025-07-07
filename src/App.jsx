
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Players from '@/pages/Players';
import TeamGenerator from '@/pages/TeamGenerator';
import GameResult from '@/pages/GameResult';
import History from '@/pages/History';
import Statistics from '@/pages/Statistics';
import Cofrinho from '@/pages/Cofrinho';

function App() {
  return (
    <>
      <Helmet>
        <title>Futsal App - Gestão de Equipas e Jogadores</title>
        <meta name="description" content="Aplicação completa para gestão de equipas de futsal, jogadores, rankings e histórico de jogos" />
      </Helmet>
      
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<Players />} />
            <Route path="/team-generator" element={<TeamGenerator />} />
            <Route path="/game-result" element={<GameResult />} />
            <Route path="/history" element={<History />} />
            <Route path="/statistics/:playerId" element={<Statistics />} />
            <Route path="/cofrinho" element={<Cofrinho />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </>
  );
}

export default App;
