import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

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

    // Récupérer les commandes récentes
    const recentOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              shopId: user.shop.id,
            },
          },
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // Calculer les statistiques
    const totalProducts = user.shop.products.length;
    const totalOrders = recentOrders.length;
    const totalRevenue = recentOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 