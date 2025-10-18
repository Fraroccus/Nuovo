import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma'; // adjust path if different

export async function GET(request: Request) {
try {
const { searchParams } = new URL(request.url);
const shelfId = searchParams.get('shelfId') ?? undefined;
const category = searchParams.get('category') ?? undefined;

const where: Prisma.ItemWhereInput = {};
if (shelfId) where.shelfId = shelfId;
if (category && category.trim() !== '') where.category = category;

const items = await prisma.item.findMany({
  where,
  include: {
    shelf: { include: { warehouse: true } },
  },
  orderBy: { name: 'asc' },
});

return NextResponse.json(items);
} catch (error) {
console.error('Error fetching items:', error);
return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
}
}
