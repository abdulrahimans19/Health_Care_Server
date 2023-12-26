import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './shared/guards';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AwsModule } from './aws/aws.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { MainCategoriesModule } from './e-commerce/main-categories/main-categories.module';
import { SubCategoriesModule } from './e-commerce/sub-categories/sub-categories.module';
import { ProductModule } from './e-commerce/product/product.module';
import { FavouritesModule } from './e-commerce/favourites/favourites.module';
import { CartModule } from './e-commerce/cart/cart.module';
import { AddressModule } from './e-commerce/address/address.module';
import { ReviewModule } from './e-commerce/review/review.module';
import { PostModule } from './community/post/post.module';
import { CommentsController } from './community/comments/comments.controller';
import { CommentsService } from './community/comments/comments.service';
import { CommentsModule } from './community/comments/comments.module';
import { CouponModule } from './e-commerce/coupon/coupon.module';
import { OrderModule } from './e-commerce/order/order.module';
import { PaymentModule } from './payment/payment.module';
import { DoctorModule } from './consultancy/doctor/doctor.module';
import { RecentSearchModule } from './e-commerce/recent-search/recent-search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MOGO_URL),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.NODEMAILER_USERNAME,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      },
      template: {
        dir: join(__dirname, 'mails'),
        adapter: new HandlebarsAdapter(),
      },
    }),
    UserModule,
    AuthModule,
    AwsModule,
    UserProfileModule,
    MainCategoriesModule,
    SubCategoriesModule,
    ProductModule,
    FavouritesModule,
    CartModule,
    AddressModule,
    ReviewModule,
    PostModule,
    CommentsModule,
    CouponModule,
    OrderModule,
    PaymentModule,
    DoctorModule,
    RecentSearchModule
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AtGuard }],
})
export class AppModule {}
