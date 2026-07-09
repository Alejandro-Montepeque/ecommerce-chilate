import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { validateEnv } from "./config/env.validation";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { CategoriesModule } from "./categories/categories.module";
import { CollectionsModule } from "./collections/collections.module";
import { SizesModule } from "./sizes/sizes.module";
import { ColorsModule } from "./colors/colors.module";
import { BannersModule } from "./banners/banners.module";
import { ContentModule } from "./content/content.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { UploadsModule } from "./uploads/uploads.module";
import { WishlistModule } from "./wishlist/wishlist.module";
import { DiscountsModule } from "./discounts/discounts.module";
import { MailModule } from "./mail/mail.module";
import { AuditModule } from "./audit/audit.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    // Configuración base de rate limiting. Solo se aplica en las rutas que
    // activan ThrottlerGuard (p. ej. login), no de forma global, para no
    // afectar la navegación ni el proxy de imágenes.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CollectionsModule,
    SizesModule,
    ColorsModule,
    BannersModule,
    ContentModule,
    OrdersModule,
    PaymentsModule,
    UploadsModule,
    WishlistModule,
    DiscountsModule,
    MailModule,
    AuditModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
