import { Competition, CompetitionRound, EventTeam, CompetitionScore, CompetitionResult } from '../models/EventCompetition.model';

export class EventCompetitionService {
  async createCompetition(tenantId: string, eventId: string, data: any) {
    const comp = new Competition({ ...data, tenantId, eventId });
    return await comp.save();
  }

  async registerTeam(tenantId: string, competitionId: string, teamData: any) {
    const team = new EventTeam({ ...teamData, tenantId, competitionId });
    return await team.save();
  }

  async recordScore(tenantId: string, scoreData: any) {
    const score = new CompetitionScore({ ...scoreData, tenantId });
    return await score.save();
  }

  async finalizeResults(tenantId: string, competitionId: string) {
    // In a real scenario, this would aggregate scores across rounds and generate CompetitionResult records.
    return { message: 'Results finalized (stub)' };
  }
}

export const eventCompetitionService = new EventCompetitionService();
