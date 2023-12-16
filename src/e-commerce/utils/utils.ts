class ProductDTO {
  _id: string;
  name: string;
  description: string;
  image: string;
  brand: string;
  price: number;
  offer_price: number;
  product_type: string;
  quantity: number;
  sub_category_id: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

class ProductWithTotalPriceDTO {
  product: ProductDTO;
  quantity: number;
  _id: string;
  created_at: Date;
  updated_at: Date;
  total_product_price: number;
}

class CalculateTotalPriceResponseDTO {
  totalPrice: number;
  products_with_total_price: ProductWithTotalPriceDTO[];
}

export function calculateTotalPrice(products): number {
  return products.reduce((total, item) => {
    const priceToUse =
      item.product.offer_price !== 0
        ? item.product.offer_price
        : item.product.price;
    return total + priceToUse * item.quantity;
  }, 0);
}

function calculateProductTotalPrice(product, quantity): number {
  const priceToUse =
    product.offer_price !== 0 ? product.offer_price : product.price;
  return priceToUse * quantity;
}

function mapToProductWithTotalPriceDTO(
  item,
  quantity,
): ProductWithTotalPriceDTO {
  const totalProductPrice = calculateProductTotalPrice(item.product, quantity);

  return {
    ...item.toObject(),
    total_product_price: totalProductPrice,
  };
}

export const calculateTotalPricePharmaCart = (
  cart,
): CalculateTotalPriceResponseDTO => {
  const totalPrice = calculateTotalPrice(cart.pharma_products);
  const products_with_total_price: ProductWithTotalPriceDTO[] =
    cart.pharma_products.map((item) =>
      mapToProductWithTotalPriceDTO(item, item.quantity),
    );

  return { totalPrice, products_with_total_price };
};

export const calculateTotalPriceFoodCart = (
  cart,
): CalculateTotalPriceResponseDTO => {
  const totalPrice = calculateTotalPrice(cart.food_products);
  const products_with_total_price: ProductWithTotalPriceDTO[] =
    cart.food_products.map((item) =>
      mapToProductWithTotalPriceDTO(item, item.quantity),
    );

  return { totalPrice, products_with_total_price };
};
