const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@joyeria.local";
  const adminPasswordHash = await bcrypt.hash("Admin12345", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const products = [
    {
      name: "Anillo Aura Dorado",
      slug: "anillo-aura-dorado",
      description: "Anillo de diseno minimalista con bano dorado.",
      price: 79.9,
      stock: 20,
      category: "Anillos",
      imageUrl: null,
    },
    {
      name: "Collar Luna Plata",
      slug: "collar-luna-plata",
      description: "Collar de plata con dije en forma de luna.",
      price: 99.5,
      stock: 15,
      category: "Collares",
      imageUrl: null,
    },
    {
      name: "Pulsera Serena",
      slug: "pulsera-serena",
      description: "Pulsera ajustable con acabado brillante.",
      price: 49,
      stock: 30,
      category: "Pulseras",
      imageUrl: null,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        imageUrl: product.imageUrl,
        active: true,
      },
      create: {
        ...product,
        active: true,
      },
    });
  }

  console.log("Seed completa");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
