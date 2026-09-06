export interface ProductProps {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
  imageUrl?: string;
}

export class Product {
  private constructor(private props: ProductProps) {}

  static fromPersistence(props: ProductProps): Product {
    return new Product(props);
  }

  get id(): string {
    return this.props.id;
  }
  get priceInCents(): number {
    return this.props.priceInCents;
  }
  get stock(): number {
    return this.props.stock;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string {
    return this.props.description;
  }
  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  hasStockFor(quantity: number): boolean {
    return this.props.stock >= quantity;
  }

  toPersistence(): ProductProps {
    return { ...this.props };
  }
}
