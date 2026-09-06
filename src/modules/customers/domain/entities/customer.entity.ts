export interface CustomerProps {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  docType: 'CC' | 'CE' | 'NIT' | 'PASSPORT';
  docNumber: string;
}

export class Customer {
  private constructor(private props: CustomerProps) {}

  static fromPersistence(props: CustomerProps): Customer {
    return new Customer(props);
  }

  get id(): string {
    return this.props.id;
  }
  get email(): string {
    return this.props.email;
  }

  toPersistence(): CustomerProps {
    return { ...this.props };
  }
}
