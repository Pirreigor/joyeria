const XLSX = require("xlsx");
const cloudinary = require("../utils/cloudinary");
const prisma = require("../utils/prisma");

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function buildCategoryFolder(categoryName) {
  if (!categoryName) return "sin-categoria";

  const category = await prisma.categoria.findFirst({
    where: { name: categoryName },
    include: { parent: true },
  });

  if (!category) return slugify(categoryName);

  if (category.parent) {
    return `${slugify(category.parent.name)}/${slugify(category.name)}`;
  }

  return slugify(category.name);
}

async function uploadToCloudinary(buffer, folder = "sin-categoria") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `joyeria/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No se envio ninguna imagen" });
  }

  const categoryName = req.body?.category || null;

  try {
    const folder = await buildCategoryFolder(categoryName);
    const url = await uploadToCloudinary(req.file.buffer, folder);
    return res.json({ url });
  } catch (error) {
    return res.status(500).json({ message: "Error al subir imagen: " + error.message });
  }
}

async function exportTemplate(req, res) {
  const headers = [
    "nombre",
    "descripcion",
    "precio",
    "stock",
    "categoria",
    "materiales",
    "dimensiones",
    "cuidados",
    "grabado",
    "recomendado",
    "videoUrl",
    "imagen_archivo",
  ];

  const example = [
    "Anillo Diamante Classic",
    "Anillo de plata 925 con bano de oro",
    89.9,
    10,
    "Anillos",
    "Plata 925, bano dorado 18k",
    "Diametro 1.8 cm",
    "Evitar contacto con agua",
    "si",
    "no",
    "",
    "anillo-diamante.jpg",
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);

  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 5, 20) }));

  XLSX.utils.book_append_sheet(wb, ws, "Productos");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=plantilla_productos.xlsx");
  return res.send(buffer);
}

async function importProducts(req, res) {
  const excelFile = req.files?.file?.[0];
  if (!excelFile) {
    return res.status(400).json({ message: "No se envio archivo Excel" });
  }

  const imageFiles = req.files?.images || [];
  const imageMap = new Map();
  for (const img of imageFiles) {
    imageMap.set(img.originalname.toLowerCase(), img);
  }

  let rows;
  try {
    const wb = XLSX.read(excelFile.buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
  } catch {
    return res.status(400).json({ message: "No se pudo leer el archivo Excel" });
  }

  if (!rows || rows.length === 0) {
    return res.status(400).json({ message: "El archivo Excel esta vacio" });
  }

  const existingCategories = await prisma.categoria.findMany({ select: { name: true } });
  const categoryNames = new Set(existingCategories.map((c) => c.name.toLowerCase()));

  const existingSlugs = await prisma.producto.findMany({ select: { slug: true } });
  const slugSet = new Set(existingSlugs.map((p) => p.slug));

  const results = { created: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const nombre = String(row.nombre || "").trim();
    if (!nombre) {
      results.errors.push({ row: rowNum, error: "Nombre vacio" });
      continue;
    }

    const precio = parseFloat(row.precio);
    if (isNaN(precio) || precio < 0) {
      results.errors.push({ row: rowNum, error: `Precio invalido: ${row.precio}` });
      continue;
    }

    const categoria = String(row.categoria || "").trim();
    if (categoria && !categoryNames.has(categoria.toLowerCase())) {
      results.errors.push({ row: rowNum, error: `Categoria no existe: ${categoria}` });
      continue;
    }

    let baseSlug = slugify(nombre);
    let finalSlug = baseSlug;
    let counter = 1;
    while (slugSet.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    slugSet.add(finalSlug);

    let imageUrl = null;
    const imagenArchivo = String(row.imagen_archivo || "").trim().toLowerCase();

    if (imagenArchivo && imageMap.has(imagenArchivo)) {
      try {
        const imgFile = imageMap.get(imagenArchivo);
        const folder = await buildCategoryFolder(categoria);
        imageUrl = await uploadToCloudinary(imgFile.buffer, folder);
      } catch (err) {
        results.errors.push({ row: rowNum, error: `Error subiendo imagen ${imagenArchivo}: ${err.message}` });
      }
    }

    const grabadoRaw = String(row.grabado || "").toLowerCase();
    const recomendadoRaw = String(row.recomendado || "").toLowerCase();

    try {
      await prisma.producto.create({
        data: {
          name: nombre,
          slug: finalSlug,
          description: String(row.descripcion || "").trim(),
          price: precio,
          stock: parseInt(row.stock, 10) || 0,
          imageUrl: imageUrl || null,
          imagenes: [],
          category: categoria || null,
          materiales: String(row.materiales || "").trim() || null,
          dimensiones: String(row.dimensiones || "").trim() || null,
          cuidados: String(row.cuidados || "").trim() || null,
          grabado: ["si", "yes", "true", "1"].includes(grabadoRaw),
          recommended: ["si", "yes", "true", "1"].includes(recomendadoRaw),
          videoUrl: String(row.videoUrl || "").trim() || null,
          active: true,
        },
      });
      results.created++;
    } catch (err) {
      results.errors.push({ row: rowNum, error: `Error creando producto: ${err.message}` });
    }
  }

  return res.json({
    message: `Importacion completada: ${results.created} productos creados`,
    created: results.created,
    totalRows: rows.length,
    errors: results.errors,
  });
}

module.exports = { uploadImage, exportTemplate, importProducts };
