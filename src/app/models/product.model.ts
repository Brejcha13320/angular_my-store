export interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  description: string;
  category: Category;
  taxes?: number;
}

export interface CreateProductDTO extends Omit<Product, 'id' | 'category'> {
  categoryId: number;
}

/**
 * Todos los elementos de la interface son opcionales
 */
export interface UpdateProductDOT extends Partial<CreateProductDTO> {}

export interface Category {
  id: string;
  name: string;
  typeImg: any;
}
