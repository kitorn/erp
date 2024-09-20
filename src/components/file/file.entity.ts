import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  extension: string;

  @Column()
  mimeType: string;

  @Column('bigint')
  size: number;

  @CreateDateColumn()
  uploadDate: Date;

  @Column({ select: false })
  s3Key: string;
}
