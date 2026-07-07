import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Catálogo público: solo productos publicados.
  findPublished() {
    return this.prisma.product.findMany({
      where: { isPublished: true },
      include: { variants: true, images: true, category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // Admin: todos los productos.
  findAll() {
    return this.prisma.product.findMany({
      include: { variants: true, images: true, category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { variants: true, images: true, category: true },
    });
    if (!product) throw new NotFoundException("Producto no encontrado");
    return product;
  }

  create(dto: CreateProductDto) {
    const { variants, images, ...data } = dto;
    return this.prisma.product.create({
      data: {
        ...data,
        variants: variants ? { create: variants } : undefined,
        images: images ? { create: images } : undefined,
      },
      include: { variants: true, images: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const { variants, images, ...data } = dto;
    // Reemplaza variantes e imágenes de forma simple: borra e inserta.
    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        variants: variants ? { deleteMany: {}, create: variants } : undefined,
        images: images ? { deleteMany: {}, create: images } : undefined,
      },
      include: { variants: true, images: true },
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
