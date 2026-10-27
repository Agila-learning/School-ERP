import User, { IUser } from '../models/User.model';

export class UserRepository {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ tenantId: this.tenantId, email });
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findOne({ tenantId: this.tenantId, _id: id });
  }

  async find(query: any = {}, options: any = {}): Promise<IUser[]> {
    let mQuery = User.find({ ...query, tenantId: this.tenantId });
    if (options.populate) mQuery = mQuery.populate(options.populate);
    if (options.sort) mQuery = mQuery.sort(options.sort);
    return mQuery;
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User({ ...userData, tenantId: this.tenantId });
    return user.save();
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findOneAndUpdate(
      { tenantId: this.tenantId, _id: id },
      { $set: updateData },
      { new: true }
    );
  }
}
