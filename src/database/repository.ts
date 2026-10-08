import { Model } from 'mongoose';
import { newId } from '../common/ids';

export interface Entity {
  id: string;
}

export type CreateInput<T extends Entity> = Omit<T, 'id'> & { id?: string };

/** Storage-agnostic data access contract implemented for Mongo and in-memory modes. */
export interface Repository<T extends Entity> {
  findAll(filter?: Partial<T>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  create(data: CreateInput<T>): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T | null>;
  increment(id: string, field: keyof T & string, by?: number): Promise<T | null>;
  count(): Promise<number>;
  insertMany(items: T[]): Promise<void>;
  deleteAll(): Promise<void>;
}

const stripUndefined = (obj: object): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
};

const clone = <T>(value: T): T => structuredClone(value);

export class MemoryRepository<T extends Entity> implements Repository<T> {
  private readonly items = new Map<string, T>();

  private matches(item: T, filter?: Partial<T>): boolean {
    if (!filter) return true;
    return Object.entries(filter).every(
      ([k, v]) => v === undefined || (item as unknown as Record<string, unknown>)[k] === v,
    );
  }

  async findAll(filter?: Partial<T>): Promise<T[]> {
    return [...this.items.values()].filter((i) => this.matches(i, filter)).map(clone);
  }

  async findById(id: string): Promise<T | null> {
    const item = this.items.get(id);
    return item ? clone(item) : null;
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    const item = [...this.items.values()].find((i) => this.matches(i, filter));
    return item ? clone(item) : null;
  }

  async create(data: CreateInput<T>): Promise<T> {
    const item = { ...stripUndefined(data), id: data.id ?? newId() } as unknown as T;
    this.items.set(item.id, clone(item));
    return clone(item);
  }

  async update(id: string, patch: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    const { id: _ignored, ...rest } = stripUndefined(patch);
    const updated = { ...existing, ...clone(rest) } as T;
    this.items.set(id, updated);
    return clone(updated);
  }

  async increment(id: string, field: keyof T & string, by = 1): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    const current = Number((existing as unknown as Record<string, unknown>)[field] ?? 0);
    return this.update(id, { [field]: current + by } as unknown as Partial<T>);
  }

  async count(): Promise<number> {
    return this.items.size;
  }

  async insertMany(items: T[]): Promise<void> {
    for (const item of items) this.items.set(item.id, clone(item));
  }

  async deleteAll(): Promise<void> {
    this.items.clear();
  }
}

/** Mongoose-backed repository. Documents use string `_id`, exposed as `id`. */
export class MongoRepository<T extends Entity> implements Repository<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly model: Model<any>) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toEntity(doc: any): T | null {
    if (!doc) return null;
    const { _id, __v: _v, ...rest } = doc;
    return { id: String(_id), ...rest } as T;
  }

  private toFilter(filter: Partial<T> = {}): Record<string, unknown> {
    const { id, ...rest } = stripUndefined(filter);
    return id !== undefined ? { _id: id, ...rest } : rest;
  }

  async findAll(filter?: Partial<T>): Promise<T[]> {
    const docs = await this.model.find(this.toFilter(filter)).lean().exec();
    return (docs as unknown[]).map((d) => this.toEntity(d));
  }

  async findById(id: string): Promise<T | null> {
    return this.toEntity(await this.model.findById(id).lean().exec());
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return this.toEntity(await this.model.findOne(this.toFilter(filter)).lean().exec());
  }

  async create(data: CreateInput<T>): Promise<T> {
    const { id, ...rest } = stripUndefined(data);
    const doc = await this.model.create({ ...rest, _id: (id as string) ?? newId() });
    return this.toEntity(doc.toObject());
  }

  async update(id: string, patch: Partial<T>): Promise<T | null> {
    const { id: _ignored, ...rest } = stripUndefined(patch);
    const doc = await this.model.findByIdAndUpdate(id, { $set: rest }, { new: true }).lean().exec();
    return this.toEntity(doc);
  }

  async increment(id: string, field: keyof T & string, by = 1): Promise<T | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $inc: { [field]: by } }, { new: true })
      .lean()
      .exec();
    return this.toEntity(doc);
  }

  async count(): Promise<number> {
    return this.model.countDocuments().exec();
  }

  async insertMany(items: T[]): Promise<void> {
    if (!items.length) return;
    await this.model.insertMany(items.map(({ id, ...rest }) => ({ ...rest, _id: id })));
  }

  async deleteAll(): Promise<void> {
    await this.model.deleteMany({}).exec();
  }
}
