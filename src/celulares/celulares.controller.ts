import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CelularesService } from './celulares.service';
import { CreateCelularDto } from './dto/create-celular.dto';
import { UpdateCelularDto } from './dto/update-celular.dto';
import { QueryCelularDto } from './dto/query-celular.dto';

@Controller('celulares')
export class CelularesController {
  constructor(private readonly celularesService: CelularesService) {}

  @Post()
  create(@Body() createCelularDto: CreateCelularDto) {
    return this.celularesService.create(createCelularDto);
  }

  @Get()
  findAll(@Query() query: QueryCelularDto) {
    return this.celularesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.celularesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCelularDto: UpdateCelularDto,
  ) {
    return this.celularesService.update(id, updateCelularDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.celularesService.remove(id);
  }
}
