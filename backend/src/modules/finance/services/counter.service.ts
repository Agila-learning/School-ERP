import mongoose from 'mongoose';
import Counter from '../models/Counter.model';

export class CounterService {
  /**
   * Generates a sequential ID using MongoDB's $inc
   * @param tenantId The current tenant's ID
   * @param entity e.g. "INVOICE", "RECEIPT"
   * @param prefix e.g. "INV-2026-", "REC-"
   * @param padding Number of digits for the sequence (e.g. 5 for 00001)
   */
  static async getNextSequenceValue(
    tenantId: mongoose.Types.ObjectId,
    entity: string,
    prefix: string,
    padding: number = 5
  ): Promise<string> {
    const counter = await Counter.findOneAndUpdate(
      { tenantId, entity, prefix },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const sequenceString = counter.sequence_value.toString().padStart(padding, '0');
    return `${prefix}${sequenceString}`;
  }
}
