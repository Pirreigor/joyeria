const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@joyeria.local";
  const adminPasswordHash = await bcrypt.hash("Admin12345", 10);

  const categories = [
    {
      name: "Anillos",
      slug: "anillos",
      description: "Anillos para compromiso, ceremonia y uso diario.",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80",
      active: true,
    },
    {
      name: "Collares",
      slug: "collares",
      description: "Collares de plata y bano dorado.",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=80",
      active: true,
    },
    {
      name: "Pulseras",
      slug: "pulseras",
      description: "Pulseras delicadas para combinar en capas.",
      bannerImageUrl:
        "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?auto=format&fit=crop&w=1400&q=80",
      active: true,
    },
  ];

  for (const category of categories) {
    await prisma.categoria.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        bannerImageUrl: category.bannerImageUrl,
        active: category.active,
      },
      create: category,
    });
  }

  await prisma.configTienda.upsert({
    where: { id: 1 },
    update: {
      brandName: "Don Joyero",
      logoUrl: null,
      promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      promoVideoTitle: "Campana Primavera - Don Joyero",
    },
    create: {
      id: 1,
      brandName: "Don Joyero",
      logoUrl: null,
      promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      promoVideoTitle: "Campana Primavera - Don Joyero",
    },
  });

  const slides = [
    {
      title: "Coleccion Esencia",
      subtitle: "Piezas que celebran momentos especiales.",
      imageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80",
      ctaLabel: "Explorar catalogo",
      ctaUrl: "#catalogo",
      displayOrder: 1,
      active: true,
    },
    {
      title: "Brillo de Temporada",
      subtitle: "Joyeria fina con acabados premium.",
      imageUrl:
        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=80",
      ctaLabel: "Ver destacados",
      ctaUrl: "#catalogo",
      displayOrder: 2,
      active: true,
    },
    {
      title: "Detalles Unicos",
      subtitle: "Disenos para regalar y recordar.",
      imageUrl:
        "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=1600&q=80",
      ctaLabel: "Comprar ahora",
      ctaUrl: "#catalogo",
      displayOrder: 3,
      active: true,
    },
  ];

  for (const slide of slides) {
    await prisma.slide.upsert({
      where: { displayOrder: slide.displayOrder },
      update: {
        title: slide.title,
        subtitle: slide.subtitle,
        imageUrl: slide.imageUrl,
        ctaLabel: slide.ctaLabel,
        ctaUrl: slide.ctaUrl,
        active: slide.active,
      },
      create: slide,
    });
  }

  const flyers = [
    {
      title: "Nueva coleccion Primavera 2026",
      subtitle: "Piezas exclusivas inspiradas en la naturaleza y el brillo del sol",
      imageUrl:
        "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1800&q=80",
      linkUrl: "#catalogo",
      displayOrder: 1,
      active: true,
    },
    {
      title: "El regalo perfecto para cada momento",
      subtitle: "Anillos, collares y pulseras para sorprender a quien mas quieres",
      imageUrl:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=80",
      linkUrl: "#catalogo",
      displayOrder: 2,
      active: true,
    },
    {
      title: "Entrega a domicilio en todo el pais",
      subtitle: "Compras mayores a $120 con envio completamente gratis",
      imageUrl:
        "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1800&q=80",
      linkUrl: "#contactanos",
      displayOrder: 3,
      active: true,
    },
    {
      title: "Grabado personalizado incluido",
      subtitle: "Nombres, fechas y mensajes especiales sin costo adicional",
      imageUrl:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1800&q=80",
      linkUrl: "#catalogo",
      displayOrder: 4,
      active: true,
    },
    {
      title: "Joyeria fina con garantia de por vida",
      subtitle: "Cada pieza certificada con materiales de primera calidad",
      imageUrl:
        "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=1800&q=80",
      linkUrl: "#contactanos",
      displayOrder: 5,
      active: true,
    },
  ];

  for (const flyer of flyers) {
    await prisma.flyer.upsert({
      where: { displayOrder: flyer.displayOrder },
      update: {
        title: flyer.title,
        subtitle: flyer.subtitle,
        imageUrl: flyer.imageUrl,
        linkUrl: flyer.linkUrl,
        active: flyer.active,
      },
      create: flyer,
    });
  }

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      rol: "ADMINISTRADOR",
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
      imageUrl:
        "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80",
      recommended: true,
    },
    {
      name: "Anillo Solitario Alba",
      slug: "anillo-solitario-alba",
      description: "Solitario clasico con circon central y acabado espejo.",
      price: 92,
      stock: 14,
      category: "Anillos",
      imageUrl:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
      recommended: true,
    },
    {
      name: "Anillo Corona Rose",
      slug: "anillo-corona-rose",
      description: "Anillo de aro fino con halo rose y micro incrustaciones.",
      price: 86.5,
      stock: 18,
      category: "Anillos",
      imageUrl:
        "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80",
      recommended: false,
    },
    {
      name: "Collar Luna Plata",
      slug: "collar-luna-plata",
      description: "Collar de plata con dije en forma de luna.",
      price: 99.5,
      stock: 15,
      category: "Collares",
      imageUrl:
        "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=80",
      recommended: true,
    },
    {
      name: "Collar Estelar Doble",
      slug: "collar-estelar-doble",
      description: "Collar de doble cadena con dijes sutiles y brillo suave.",
      price: 109,
      stock: 11,
      category: "Collares",
      imageUrl:
        "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=80",
      recommended: true,
    },
    {
      name: "Collar Perla Nacar",
      slug: "collar-perla-nacar",
      description: "Diseno delicado con perla central y cadena fina.",
      price: 94.9,
      stock: 16,
      category: "Collares",
      imageUrl:
        "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80",
      recommended: false,
    },
    {
      name: "Pulsera Serena",
      slug: "pulsera-serena",
      description: "Pulsera ajustable con acabado brillante.",
      price: 49,
      stock: 30,
      category: "Pulseras",
      imageUrl:
        "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?auto=format&fit=crop&w=1200&q=80",
      recommended: false,
    },
    {
      name: "Pulsera Firenze",
      slug: "pulsera-firenze",
      description: "Pulsera de eslabones suaves en tono champagne.",
      price: 57,
      stock: 24,
      category: "Pulseras",
      imageUrl:
        "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?auto=format&fit=crop&w=1200&q=80",
      recommended: true,
    },
    {
      name: "Pulsera Eclipse",
      slug: "pulsera-eclipse",
      description: "Pulsera rigida con detalle central y terminado pulido.",
      price: 62.5,
      stock: 19,
      category: "Pulseras",
      imageUrl:
        "https://images.unsplash.com/photo-1623680604940-848c86b7d589?auto=format&fit=crop&w=1200&q=80",
      recommended: false,
    },
  ];

  for (const product of products) {
    await prisma.producto.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        imageUrl: product.imageUrl,
        recommended: Boolean(product.recommended),
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
