import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export const maxSize = 5 * 1024 * 1024; // 5 Mo

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier envoyé' }, { status: 400 });
  }

  if (file.size > maxSize) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const filePath = path.join(uploadDir, fileName);

  // S'assurer que le dossier existe
  await import('fs').then(fs => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  });

  // Lire le fichier et l'écrire sur le disque
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(filePath, buffer);

  const imageUrl = `/uploads/${fileName}`;
  return NextResponse.json({ url: imageUrl });
} 