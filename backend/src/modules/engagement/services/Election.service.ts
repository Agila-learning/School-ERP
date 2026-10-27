import { StudentElection, ElectionCandidate, ElectionVote, ElectionResult } from '../models/Leadership.model';

export class ElectionService {
  async castVote(tenantId: string, electionId: string, voterId: string, candidateId: string, ipAddress?: string) {
    const election = await StudentElection.findOne({ _id: electionId, tenantId });
    if (!election) throw new Error('Election not found');
    
    if (election.status !== 'Voting Open') {
      throw new Error('Voting is not currently open for this election');
    }

    // Check if candidate exists and is approved
    const candidate = await ElectionCandidate.findOne({ _id: candidateId, electionId, approvalStatus: 'Approved' });
    if (!candidate) throw new Error('Invalid or unapproved candidate');

    // The unique index on ElectionVote (tenantId, electionId, voterId) prevents double voting at the DB level
    try {
      const vote = new ElectionVote({
        tenantId,
        electionId,
        voterId,
        candidateId,
        ipAddress
      });
      await vote.save();
      return { success: true, message: 'Vote cast successfully' };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Voter has already cast a vote in this election');
      }
      throw error;
    }
  }

  async closeElectionAndTally(tenantId: string, electionId: string) {
    const election = await StudentElection.findOne({ _id: electionId, tenantId });
    if (!election) throw new Error('Election not found');

    const results = await ElectionVote.aggregate([
      { $match: { tenantId, electionId: election._id } },
      { $group: { _id: '$candidateId', totalVotes: { $sum: 1 } } },
      { $sort: { totalVotes: -1 } }
    ]);

    // Clear existing unlocked results
    await ElectionResult.deleteMany({ tenantId, electionId, locked: false });

    const newResults = results.map((res: any, index: number) => ({
      tenantId,
      electionId,
      candidateId: res._id,
      totalVotes: res.totalVotes,
      rank: index + 1,
      locked: true
    }));

    if (newResults.length > 0) {
      await ElectionResult.insertMany(newResults);
    }

    election.status = 'Result Published';
    await election.save();

    return newResults;
  }
}

export const electionService = new ElectionService();
