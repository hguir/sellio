import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { NotificationType, OrderStatus } from '@prisma/client';

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

    const orders = await prisma.order.findMany({
      where: {
        shopId: user.shop.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
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
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      shopId,
      items,
      total,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
    } = data;

    // Vérifier si la boutique existe
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { owner: true },
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'Boutique non trouvée' },
        { status: 404 }
      );
    }

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber: `CMD-${Date.now()}`,
        total,
        status: OrderStatus.PENDING,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        shop: { connect: { id: shopId } },
        customer: { connect: { id: session.user.id } },
        items: {
          create: items.map((item: any) => ({
            quantity: item.quantity,
            price: item.price,
            product: { connect: { id: item.productId } },
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Envoyer une notification au marchand
    await prisma.notification.create({
      data: {
        type: NotificationType.ORDER,
        title: 'Nouvelle commande',
        message: `Nouvelle commande #${order.orderNumber} de ${customerName}`,
        shop: { connect: { id: shopId } },
        user: { connect: { id: shop.ownerId } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
} 