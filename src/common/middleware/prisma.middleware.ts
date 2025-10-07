import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async delete({ args, query }) {
        return query({
          where: args.where,
          data: { deletedAt: new Date() },
        } as any);
      },
      async deleteMany({ args, query }) {
        return query({
          where: args.where,
          data: { deletedAt: new Date() },
        } as any);
      },
    },
  },
});
