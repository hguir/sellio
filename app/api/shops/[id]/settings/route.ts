import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { z } from 'zod';

const shopSettingsSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  logo: z.string().url('URL du logo invalide').optional(),
  banner: z.string().url('URL de la bannière invalide').optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur primaire invalide'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur secondaire invalide'),
  contactEmail: z.string().email('Email invalide').optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  socialMedia: z.object({
    facebook: z.string().url('URL Facebook invalide').optional(),
    instagram: z.string().url('URL Instagram invalide').optional(),
    twitter: z.string().url('URL Twitter invalide').optional(),
  }).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        description: true,
        logo: true,
        banner: true,
        primaryColor: true,
        secondaryColor: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        socialMedia: true,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { message: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      include: { shop: true },
    });

    if (!user?.shop || user.shop.id !== params.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = shopSettingsSchema.parse(body);

    const updatedShop = await prisma.shop.update({
      where: { id: params.id },
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