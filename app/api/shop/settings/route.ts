import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { z } from 'zod';

const shopSettingsSchema = z.object({
  name: z.string().min(1, 'Le nom de la boutique est requis'),
  description: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  theme: z.enum(['sellio', 'custom']),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'La couleur principale doit être une couleur hexadécimale valide'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'La couleur secondaire doit être une couleur hexadécimale valide'),
  currency: z.string().min(1, 'La devise est requise'),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  socialMedia: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
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
        shop: true,
      },
    });

    if (!user?.shop) {
      return NextResponse.json(
        { message: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.shop);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
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
    const validatedData = shopSettingsSchema.parse(body);

    const updatedShop = await prisma.shop.update({
      where: { id: user.shop.id },
      data: validatedData,
    });

    return NextResponse.json(updatedShop);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 