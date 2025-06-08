import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number().positive('Le prix doit être positif'),
  stock: z.number().int().min(0, 'Le stock doit être positif'),
  images: z.array(
    z.string().refine(
      (val) => val.startsWith('/uploads/') || /^https?:\/\//.test(val),
      { message: "L'URL de l'image doit être valide" }
    )
  ).min(1, "Au moins une image est requise"),
  showStock: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        shop: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!user?.shop) {
      return NextResponse.json(
        { message: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.shop.products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        shop: true,
      },
    });

    if (!user?.shop) {
      return NextResponse.json(
        { message: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        shopId: user.shop.id,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création du produit:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        shop: true,
      },
    });

    if (!user?.shop) {
      return NextResponse.json(
        { message: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { id, ...data } = body;
    const validatedData = productSchema.parse(data);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        shop: true,
      },
    });

    if (!product || product.shop.id !== user.shop.id) {
      return NextResponse.json(
        { message: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour du produit:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 