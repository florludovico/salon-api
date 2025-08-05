import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getUsers(page = 1, limit = 5, role?: UserRole, search?: string) {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :search', { search: `%${search}%` })
            .orWhere('user.lastName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      users,
      total,
    };
  }

  async getUser(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado`);
    }

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...dataToUpdate } = updateUserDto;
    if (password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate['password'] = hashedPassword;
    }
    const result = await this.usersRepository.update(id, dataToUpdate);
    if (result.affected === 0) {
      throw new NotFoundException(`User with Id ${id} not found`);
    }
    return this.getUser(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado`);
    }
  }

  //para restaurar un usuario borrado lógicamente

  async restore(id: string): Promise<void> {
    const result = await this.usersRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado`);
    }
  }
}
