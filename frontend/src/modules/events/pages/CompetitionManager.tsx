import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel, CircularProgress, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { getEvents, getCompetitions, getTeams, getScores, recordScore } from '../api/events.api';
import type { SchoolEvent, Competition, EventTeam, CompetitionScore } from '../api/events.api';

const CompetitionManager: React.FC = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  
  const [teams, setTeams] = useState<EventTeam[]>([]);
  const [scores, setScores] = useState<CompetitionScore[]>([]);
  const [loading, setLoading] = useState(false);

  // Score modal
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<EventTeam | null>(null);
  const [round, setRound] = useState<number>(1);
  const [scoreVal, setScoreVal] = useState<number>(0);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      getCompetitions(selectedEventId).then(setCompetitions);
      setSelectedCompId('');
      setTeams([]);
      setScores([]);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (selectedCompId) {
      loadLeaderboard();
    }
  }, [selectedCompId]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const [tData, sData] = await Promise.all([
        getTeams(selectedCompId),
        getScores(selectedCompId)
      ]);
      setTeams(tData);
      setScores(sData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveScore = async () => {
    if (!currentTeam) return;
    try {
      await recordScore(selectedCompId, {
        teamId: currentTeam._id,
        round,
        score: scoreVal
      });
      setScoreModalOpen(false);
      loadLeaderboard();
    } catch (e) {
      console.error(e);
      alert('Failed to save score');
    }
  };

  const getTeamTotal = (teamId: string) => {
    return scores.filter(s => s.teamId === teamId).reduce((sum, s) => sum + s.score, 0);
  };

  const sortedTeams = [...teams].sort((a, b) => getTeamTotal(b._id) - getTeamTotal(a._id));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Competition Manager</Typography>
        <Button variant="contained">Lock Results</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Select Event</InputLabel>
          <Select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
            {events.map(ev => <MenuItem key={ev._id} value={ev._id}>{ev.title}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 250 }} disabled={!selectedEventId}>
          <InputLabel>Select Competition</InputLabel>
          <Select value={selectedCompId} onChange={e => setSelectedCompId(e.target.value)}>
            {competitions.map(comp => <MenuItem key={comp._id} value={comp._id}>{comp.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {selectedCompId && (
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Live Leaderboard</Typography>
            {loading ? <CircularProgress /> : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Team Name</TableCell>
                    <TableCell>Total Score</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedTeams.map((team, index) => (
                    <TableRow key={team._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell><strong>{getTeamTotal(team._id)}</strong></TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => { setCurrentTeam(team); setScoreModalOpen(true); }}>
                          Add Score
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedTeams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No teams registered for this competition.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Score Modal */}
      <Dialog open={scoreModalOpen} onClose={() => setScoreModalOpen(false)}>
        <DialogTitle>Add Score for {currentTeam?.name}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
          <TextField label="Round Number" type="number" value={round} onChange={e => setRound(Number(e.target.value))} />
          <TextField label="Score" type="number" value={scoreVal} onChange={e => setScoreVal(Number(e.target.value))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScoreModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveScore}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompetitionManager;
