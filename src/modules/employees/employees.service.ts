import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './DTOs/create-employee.dto';
import { UpdateEmployeeDto } from './DTOs/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const { cuil, phone, email } = createEmployeeDto;

    const existingEmployee = await this.employeesRepository.findOne({
      where: [{ cuil }, { phone }, { email }],
    });

    if (existingEmployee) {
      throw new ConflictException('El CUIL, teléfono o email ya están en uso');
    }

    const newEmployee = this.employeesRepository.create(createEmployeeDto);
    return this.employeesRepository.save(newEmployee);
  }

  async findAll(page = 1, limit = 5, search?: string) {
    const queryBuilder =
      this.employeesRepository.createQueryBuilder('employee');

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('employee.name ILIKE :search', { search: `%${search}%` })
            .orWhere('employee.lastName ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('employee.cuil ILIKE :search', { search: `%${search}%` })
            .orWhere('employee.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const [employees, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: employees,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOneBy({ id });
    if (!employee) {
      throw new NotFoundException(`Empleado con ID '${id}' no encontrado`);
    }
    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const result = await this.employeesRepository.update(id, updateEmployeeDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Empleado con ID '${id}' no encontrado`);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.employeesRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Empleado con ID '${id}' no encontrado`);
    }
  }

  async restore(id: string): Promise<void> {
    const result = await this.employeesRepository.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Empleado con ID '${id}' no encontrado`);
    }
  }
}
