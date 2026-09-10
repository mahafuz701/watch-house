import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { productsRouter } from "../modules/products/products.routes";
import { cartRouter } from "../modules/cart/cart.routes";
import { wishlistRouter } from "../modules/wishlist/wishlist.routes";
import { ordersRouter } from "../modules/orders/orders.routes";
import { couponsRouter } from "../modules/coupons/coupons.routes";
import { reviewsRouter } from "../modules/reviews/reviews.routes";
import { paymentsRouter } from "../modules/payments/payments.routes";
import { accountRouter } from "../modules/users/users.routes";
import { adminRouter } from "../modules/admin/admin.routes";
import { miscRouter } from "../modules/misc/misc.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/coupons", couponsRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/account", accountRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/", miscRouter); // categories, brands, settings, notifications…