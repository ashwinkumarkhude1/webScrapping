import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, Unique,PrimaryColumn} from "typeorm";
@Entity()
@Unique(['name', 'address','price','rating','source','amenities'])
export class Hotel extends BaseEntity{
  @PrimaryGeneratedColumn()
  id!: number;
  @PrimaryColumn({ name: 'name' })
  name!: string;
  @PrimaryColumn({ name: 'address' })
  address!: string;
  @PrimaryColumn({ name: 'price' })
  price!: number;
  @PrimaryColumn({ name: 'rating' })
  rating!: number;
  @PrimaryColumn({ name: 'source' })
  source!: string;
  @PrimaryColumn({ name: 'amenities' })
  amenities!: string;
}
// @PrimaryColumn({ name: 'first_name' })