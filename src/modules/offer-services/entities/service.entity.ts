import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkPhoto } from './workPhoto.entity';
import { Category } from './category.entity';
import { Employee } from 'src/modules/employees/entities/employee.entity';

@Entity({ name: 'SERVICES' })
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  title: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  duration_minutes: number;

  @ManyToOne(() => Employee, (employee) => employee.services)
  @JoinColumn()
  employee: Employee;

  @ManyToOne(() => Category, (category) => category.services)
  @JoinColumn()
  category: Category;

  @OneToMany(() => WorkPhoto, (work_photo) => work_photo.service)
  @JoinColumn()
  work_photos: WorkPhoto[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
