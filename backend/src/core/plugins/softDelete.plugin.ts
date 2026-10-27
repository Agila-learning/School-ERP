import { Schema } from 'mongoose';

export interface ISoftDeleted {
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

export const softDeletePlugin = (schema: Schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  });

  // Automatically filter out deleted documents on 'find' operations
  const types = ['find', 'findOne', 'findOneAndUpdate', 'countDocuments'];
  types.forEach((type) => {
    schema.pre(type as any, function (this: any) {
      if (this.getQuery().isDeleted === undefined) {
        this.where({ isDeleted: { $ne: true } });
      }
    });
  });
};
