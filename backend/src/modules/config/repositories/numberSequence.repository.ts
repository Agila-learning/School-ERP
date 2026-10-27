import { BaseRepository } from '../../../core/repositories/base.repository';
import NumberSequence, { INumberSequence } from '../models/NumberSequence.model';
import mongoose from 'mongoose';

export class NumberSequenceRepository extends BaseRepository<INumberSequence> {
  constructor(tenantId: string) {
    super(NumberSequence, tenantId);
  }

  async findByType(type: string): Promise<INumberSequence | null> {
    return this.findOne({ type });
  }

  // Atomic operation to generate the next number safely in concurrent environments
  async getNextSequence(type: string): Promise<string> {
    const sequence = await NumberSequence.findOneAndUpdate(
      { tenantId: this.tenantId, type, isDeleted: false },
      { 
        $inc: { currentNumber: 1 },
        $setOnInsert: {
          padding: 6,
          prefix: type,
          includeYear: true,
          includeBranchCode: false,
          resetPolicy: 'YEARLY'
        }
      },
      { new: true, upsert: true } // Returns the updated document, creates if doesn't exist
    );

    if (!sequence) {
      throw new Error(`NumberSequence of type ${type} failed to generate.`);
    }

    // Format the number: Prefix + Padding + Suffix
    const paddedNumber = sequence.currentNumber.toString().padStart(sequence.padding, '0');
    let generatedNumber = '';
    
    if (sequence.prefix) generatedNumber += `${sequence.prefix}-`;
    if (sequence.includeYear) {
      const year = new Date().getFullYear();
      generatedNumber += `${year}-`;
    }
    
    generatedNumber += paddedNumber;
    
    if (sequence.suffix) generatedNumber += `-${sequence.suffix}`;

    return generatedNumber;
  }
}
