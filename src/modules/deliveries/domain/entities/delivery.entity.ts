export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'SHIPPED';

export interface DeliveryProps {
  transactionId: string;
  customerId: string;
  address: string;
  city: string;
  status: DeliveryStatus;
}

export class Delivery {
  private constructor(private props: DeliveryProps) {}

  static create(params: Omit<DeliveryProps, 'status'>): Delivery {
    return new Delivery({ ...params, status: 'PENDING' });
  }

  static fromPersistence(props: DeliveryProps): Delivery {
    return new Delivery(props);
  }

  assign(): void {
    this.props.status = 'ASSIGNED';
  }

  toPersistence(): DeliveryProps {
    return { ...this.props };
  }
}
